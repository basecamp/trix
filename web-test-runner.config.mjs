import { playwrightLauncher } from '@web/test-runner-playwright';
import path from 'path';
import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

// Load source map for translating stack traces (local dev only)
let sourceMapConsumer = null;
const sourceMapPath = path.join(process.cwd(), 'dist/test.js.map');
if (fs.existsSync(sourceMapPath)) {
  const sourceMapData = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));
  sourceMapConsumer = await new SourceMapConsumer(sourceMapData);
}

// Translate a stack trace using source maps
function translateStack(stack) {
  if (!sourceMapConsumer || !stack) return stack;

  return stack.split('\n').map(line => {
    // Match stack frame pattern: "at ... (url:line:col)" or "at url:line:col"
    const match = line.match(/^(\s*at\s+.*?)(?:\()?(?:https?:\/\/[^/]+)?\/dist\/test\.js[^:]*:(\d+):(\d+)\)?$/);
    if (!match) return line;

    const [, prefix, lineNum, colNum] = match;
    const pos = sourceMapConsumer.originalPositionFor({
      line: parseInt(lineNum, 10),
      column: parseInt(colNum, 10)
    });

    if (pos.source) {
      const source = pos.source.replace(/^\.\.\//, '');
      return `${prefix}(${source}:${pos.line}:${pos.column})`;
    }
    return line;
  }).join('\n');
}

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
    // Use tunnelName for SC5 (tunnelIdentifier is SC4 legacy)
    ...(SAUCE_TUNNEL_IDENTIFIER && { tunnelName: SAUCE_TUNNEL_IDENTIFIER }),
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
    // Android emulator - Chrome browser
    webdriverLauncher({
      ...sauceLabsConfig,
      capabilities: {
        browserName: 'chrome',
        platformName: 'Android',
        'appium:deviceName': 'Android GoogleAPI Emulator',
        'appium:platformVersion': '14.0',
        'appium:automationName': 'UiAutomator2',
        'sauce:options': sauceOptions,
      },
    }),
  ];
};

// Default to Playwright Chromium for local development
const defaultBrowsers = [
  playwrightLauncher({ product: 'chromium' }),
];

// Enable real-time progress reporting for local dev (single browser)
const localDev = !sauceLabsConfig && !process.env.CI;

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

  // Use static logging for real-time progress (local dev only)
  staticLogging: localDev,

  // Custom reporter for local dev; undefined falls back to default for CI
  reporters: localDev ? [
    {
      onTestRunFinished({ sessions }) {
        let passed = 0, failed = 0, skipped = 0;
        for (const session of sessions) {
          const countTests = (suite) => {
            for (const test of suite.tests || []) {
              if (test.skipped) skipped++;
              else if (test.passed) passed++;
              else failed++;
            }
            for (const child of suite.suites || []) countTests(child);
          };
          if (session.testResults) countTests(session.testResults);
        }
        const total = passed + failed + skipped;
        process.stdout.write(`\n\n${total} tests: ${passed} passed, ${failed} failed, ${skipped} skipped.\n\n`);
      },
    },
  ] : undefined,

  // Middleware to serve test fixtures and QUnit from local files
  middleware: [
    // Real-time test progress reporting
    async function testProgressReporter(context, next) {
      if (context.method === 'POST' && context.url === '/test-progress') {
        const chunks = [];
        for await (const chunk of context.req) {
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString();
        const { status, name, error } = JSON.parse(body);
        // Match the same logic used in the reporter: skipped, failed, or passed (everything else)
        const progressIndicator = status === 'skipped' ? 'S' : status === 'failed' ? 'F' : '.';
        process.stdout.write(progressIndicator);

        // Print failure details immediately
        if (status === 'failed') {
          process.stdout.write(`\n\nFAIL: ${name}\n`);
          if (error) {
            if (error.message) {
              process.stdout.write(`  Message: ${error.message}\n`);
            }
            if (error.expected !== undefined) {
              process.stdout.write(`  Expected: ${error.expected}\n`);
            }
            if (error.actual !== undefined) {
              process.stdout.write(`  Actual: ${error.actual}\n`);
            }
            if (error.stack) {
              const translatedStack = translateStack(error.stack);
              process.stdout.write(`  Stack:\n    ${translatedStack.split('\n').join('\n    ')}\n`);
            }
          }
          process.stdout.write('\n');
        }

        context.status = 200;
        context.body = 'ok';
        return;
      }
      return next();
    },
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

    // Real-time progress reporting only for local dev (single browser)
    const reportProgress = ${localDev};

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
        // POST progress to server for real-time output
        if (reportProgress) {
          const payload = { status: result.status };
          if (result.status === 'failed') {
            payload.name = result.fullName.join(' > ');
            if (result.errors?.[0]) {
              const err = result.errors[0];
              payload.error = {
                message: err.message || 'Assertion Error',
                expected: JSON.stringify(err.expected, null, 2),
                actual: JSON.stringify(err.actual, null, 2),
                stack: err.stack
              };
            }
          }
          fetch('/test-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        }

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
