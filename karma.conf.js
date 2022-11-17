const config = {
  browsers: [ "ChromeHeadless" ],
  frameworks: [ "qunit" ],
  files: [
    { pattern: "dist/test.js", watched: false },
    { pattern: "src/test_helpers/fixtures/*.png", watched: false, included: false, served: true }
  ],
  proxies: {
    "/test_helpers/fixtures/": "/base/src/test_helpers/fixtures/"
  },
  client: {
    clearContext: false,
    qunit: {
      showUI: true
    }
  },

  hostname: "0.0.0.0",

  singleRun: true,
  autoWatch: false,

  concurrency: 4,
  captureTimeout: 240000,
  browserDisconnectTimeout: 240000,
  browserDisconnectTolerance: 3,
  browserNoActivityTimeout: 300000,
}

/* eslint camelcase: "off",  */

if (process.env.CI) {
  config.customLaunchers = {
    sl_chrome_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      version: "latest"
    },
    sl_chrome_latest_i8n: {
      base: "SauceLabs",
      browserName: "chrome",
      version: "latest",
      chromeOptions: {
        args: [ "--lang=tr" ]
      }
    },
    // Context:
    // https://github.com/karma-runner/karma-sauce-launcher/issues/275
    // https://saucelabs.com/blog/update-firefox-tests-before-oct-4-2022
    sl_firefox_latest: {
      base: "SauceLabs",
      browserName: "firefox",
      browserVersion: "latest",
      "moz:debuggerAddress": true
    },
    sl_safari_12_1: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "macOS 10.13",
      version: "12.1"
    },
    sl_edge_latest: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      platform: "Windows 10",
      version: "latest"
    },
    sl_ios_latest: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "ios",
      device: "iPhone X Simulator",
      version: "13.0"
    },
    sl_android_9: {
      base: "SauceLabs",
      browserName: "chrome",
      platform: "android",
      device: "Android GoogleAPI Emulator",
      version: "9.0"
    },
    sl_android_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      platform: "android",
      device: "Android GoogleAPI Emulator",
      version: "12.0"
    }
  }

  config.browsers = Object.keys(config.customLaunchers)
  config.reporters = [ "dots", "saucelabs" ]

  config.sauceLabs = {
    testName: "Trix",
    retryLimit: 3,
    idleTimeout: 600,
    commandTimeout: 600,
    maxDuration: 900,
    build: buildId(),
  }
}

function buildId() {
  const { GITHUB_WORKFLOW, GITHUB_RUN_NUMBER, GITHUB_RUN_ID } = process.env
  return GITHUB_WORKFLOW && GITHUB_RUN_NUMBER && GITHUB_RUN_ID
    ? `${GITHUB_WORKFLOW} #${GITHUB_RUN_NUMBER} (${GITHUB_RUN_ID})`
    : ""
}

module.exports = function(karmaConfig) {
  karmaConfig.set(config)
}
