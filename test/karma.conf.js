const config = {
  browsers: ["ChromeHeadless"],
  frameworks: ["qunit"],
  files: [
    { pattern: "dist/trix.js", watched: false },
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

  captureTimeout: 240000,
  browserDisconnectTimeout: 240000,
  browserDisconnectTolerance: 3,
  browserNoActivityTimeout: 300000,
}

if (process.env.CI) {
  config.customLaunchers = {
    sl_chrome_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      platform: "Windows 10",
      version: "latest"
    },
    sl_firefox_latest: {
      base: "SauceLabs",
      browserName: "firefox",
      platform: "Windows 10",
      version: "latest"
    },
    sl_safari_previous: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "macOS 10.13",
      version: "latest-1"
    },
    sl_safari_latest: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "macOS 10.13",
      version: "latest"
    },
    sl_edge_previous: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      platform: "Windows 10",
      version: "17.17134"
    },
    sl_edge_latest: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      platform: "Windows 10",
      version: "18.17763"
    },
    sl_ie_11: {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 8.1",
      version: "11"
    },
    sl_ios_previous: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "ios",
      device: "iPhone Simulator",
      version: "11.3"
    },
    sl_ios_latest: {
      base: "SauceLabs",
      browserName: "safari",
      platform: "ios",
      device: "iPhone Simulator",
      version: "12.0"
    },
    sl_android_previous: {
      base: "SauceLabs",
      browserName: "chrome",
      platform: "android",
      device: "Android GoogleAPI Emulator",
      version: "7.1"
    },
    sl_android_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      platform: "android",
      device: "Android GoogleAPI Emulator",
      version: "8.1"
    }
  }

  config.browsers = Object.keys(config.customLaunchers)
  config.reporters = ["dots", "saucelabs"]

  config.sauceLabs = {
    testName: "Trix",
    retryLimit: 3,
    idleTimeout: 600,
    commandTimeout: 600,
    maxDuration: 900,
    build: buildId(),
  }

  function buildId() {
    const { GITHUB_WORKFLOW, GITHUB_RUN_NUMBER, GITHUB_RUN_ID } = process.env
    return GITHUB_WORKFLOW && GITHUB_RUN_NUMBER && GITHUB_RUN_ID
      ? `${GITHUB_WORKFLOW} #${GITHUB_RUN_NUMBER} (${GITHUB_RUN_ID})`
      : ""
  }
}

module.exports = function(karmaConfig) {
  karmaConfig.set(config)
}
