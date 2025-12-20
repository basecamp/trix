import { playwrightLauncher } from '@web/test-runner-playwright';
import path from 'path';
import fs from 'fs';

// Map SAUCE_REGION env var to hostname
const sauceRegionHostnames = {
  'us': 'ondemand.us-west-1.saucelabs.com',
  'us-west-1': 'ondemand.us-west-1.saucelabs.com',
  'us-east-4': 'ondemand.us-east-4.saucelabs.com',
  'eu': 'ondemand.eu-central-1.saucelabs.com',
  'eu-central-1': 'ondemand.eu-central-1.saucelabs.com',
};

// Build SauceLabs launchers if credentials are available
const sauceLabsConfig = process.env.SAUCE_ACCESS_KEY ? {
  hostname: sauceRegionHostnames[process.env.SAUCE_REGION] || 'ondemand.us-west-1.saucelabs.com',
  port: 443,
  path: '/wd/hub',
  protocol: 'https',
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
} : null;

// Dynamic import for webdriver launcher only when needed
const createSauceLabsLaunchers = async () => {
  if (!sauceLabsConfig) return [];

  const { webdriverLauncher } = await import('@web/test-runner-webdriver');

  const { GITHUB_WORKFLOW, GITHUB_RUN_NUMBER, GITHUB_RUN_ID, SAUCE_TUNNEL_IDENTIFIER } = process.env;

  const buildId = GITHUB_WORKFLOW && GITHUB_RUN_NUMBER && GITHUB_RUN_ID
    ? `${GITHUB_WORKFLOW} #${GITHUB_RUN_NUMBER} (${GITHUB_RUN_ID})`
    : 'local';

  const sauceOptions = {
    name: 'Trix',
    build: buildId,
    ...(SAUCE_TUNNEL_IDENTIFIER && { tunnelIdentifier: SAUCE_TUNNEL_IDENTIFIER }),
  };

  return [
    webdriverLauncher({
      ...sauceLabsConfig,
      capabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        'sauce:options': sauceOptions,
      },
    }),
    webdriverLauncher({
      ...sauceLabsConfig,
      capabilities: {
        browserName: 'firefox',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        'moz:debuggerAddress': true,  // Required for SauceLabs Firefox
        'sauce:options': sauceOptions,
      },
    }),
    webdriverLauncher({
      ...sauceLabsConfig,
      capabilities: {
        browserName: 'MicrosoftEdge',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        'sauce:options': sauceOptions,
      },
    }),
  ];
};

// Default to Playwright Chromium for local development
const defaultBrowsers = [
  playwrightLauncher({ product: 'chromium' }),
];

export default {
  // The test file(s)
  files: ['dist/test.js'],

  // Serve files from project root
  rootDir: '.',

  // Bind to all interfaces so Sauce Connect can reach the server
  hostname: '0.0.0.0',

  // Enable node module resolution for WTR core imports
  nodeResolve: true,

  // Browser configuration - SauceLabs if credentials available, otherwise Playwright
  browsers: sauceLabsConfig ? await createSauceLabsLaunchers() : defaultBrowsers,

  // Timeouts (generous for SauceLabs network latency and slow tests)
  browserStartTimeout: 120000,
  testsStartTimeout: 120000,
  testsFinishTimeout: 600000,

  // Parallel browser execution
  concurrency: sauceLabsConfig ? 4 : 1,

  // Middleware to serve test fixtures and QUnit from local files
  middleware: [
    function serveLocalFiles(context, next) {
      // Serve test fixtures from src/test/test_helpers/fixtures/
      if (context.url.startsWith('/test_helpers/fixtures/')) {
        const filePath = path.join(process.cwd(), 'src/test', context.url);
        if (fs.existsSync(filePath)) {
          context.body = fs.createReadStream(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif' };
          context.type = mimeTypes[ext] || 'application/octet-stream';
          return;
        }
      }
      // Serve QUnit from node_modules (avoid CDN issues with SauceLabs)
      if (context.url.startsWith('/qunit/')) {
        const filePath = path.join(process.cwd(), 'node_modules', context.url);
        if (fs.existsSync(filePath)) {
          context.body = fs.createReadStream(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = { '.js': 'application/javascript', '.css': 'text/css' };
          context.type = mimeTypes[ext] || 'application/octet-stream';
          return;
        }
      }
      return next();
    },
  ],

  // Custom HTML that sets up QUnit and bridges to WTR
  // Note: first param is testFrameworkImport (mocha path by default), which we ignore
  // We use getConfig() to get the actual test file path
  testRunnerHtml: () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Trix Tests</title>
  <link rel="stylesheet" href="/qunit/qunit/qunit.css">
  <link rel="stylesheet" href="/dist/trix.css">
  <style>
    #trix-container { height: 150px; }
    trix-toolbar { margin-bottom: 10px; }
    trix-toolbar button { border: 1px solid #ccc; background: #fff; }
    trix-toolbar button.active { background: #d3e6fd; }
    trix-toolbar button:disabled { color: #ccc; }
    #qunit { position: relative !important; }
  </style>
</head>
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>

  <!-- 1. Load QUnit locally (classic script, runs first) -->
  <script src="/qunit/qunit/qunit.js"></script>

  <!-- 2. Prevent QUnit autostart before we set up hooks -->
  <script>QUnit.config.autostart = false;</script>

  <!-- 3. WTR integration + load tests + start QUnit -->
  <script type="module">
    import { getConfig, sessionStarted, sessionFinished, sessionFailed }
      from '@web/test-runner-core/browser/session.js';

    try {
      await sessionStarted();

      // Get the actual test file path from WTR config
      const { testFile } = await getConfig();

      // Build test results structure for WTR
      const testSuite = { name: testFile, tests: [], suites: [] };
      const errors = [];

      QUnit.on('error', (error) => {
        errors.push({ message: error?.message, stack: error?.stack });
      });

      QUnit.on('testEnd', (result) => {
        // Navigate to correct suite in hierarchy
        const modules = result.fullName.slice(0, -1);
        let currentSuite = testSuite;
        for (const name of modules) {
          let suite = currentSuite.suites.find(s => s.name === name);
          if (!suite) {
            suite = { name, suites: [], tests: [] };
            currentSuite.suites.push(suite);
          }
          currentSuite = suite;
        }

        const testResult = {
          name: result.name,
          passed: result.status !== 'failed',
          skipped: result.status === 'skipped',
          duration: result.runtime
        };

        if (!testResult.passed && result.errors?.[0]) {
          const err = result.errors[0];
          testResult.error = {
            message: err.message || 'Assertion Error',
            expected: JSON.stringify(err.expected, null, 2),
            actual: JSON.stringify(err.actual, null, 2),
            stack: err.stack
          };
        }
        currentSuite.tests.push(testResult);
      });

      QUnit.on('runEnd', (results) => {
        sessionFinished({
          passed: results.status === 'passed',
          errors,
          testResults: testSuite
        }).catch(console.error);
      });

      // Import test bundle using path from getConfig()
      await import(testFile);

      // Start QUnit
      QUnit.start();
    } catch (error) {
      console.error('Test setup failed:', error);
      sessionFailed({ message: error.message, stack: error.stack });
    }
  </script>
</body>
</html>
  `,
};
