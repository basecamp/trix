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

  hostname: process.env.SAUCE_ACCESS_KEY ? "localhost" : "0.0.0.0",
  listenAddress: "0.0.0.0",

  singleRun: true,
  autoWatch: false,

  concurrency: 4,
  captureTimeout: 240000,
  browserDisconnectTimeout: 240000,
  browserDisconnectTolerance: 3,
  browserNoActivityTimeout: 300000,
}

/* eslint camelcase: "off",  */

if (process.env.SAUCE_ACCESS_KEY) {
  const sauceRegion = process.env.SAUCE_REGION || "us"
  const sauceConnectVersion = process.env.SAUCE_CONNECT_VERSION || "4.9.2"
  const sauceTunnelIdentifier = process.env.SAUCE_TUNNEL_IDENTIFIER

  config.customLaunchers = {
    sl_chrome_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      browserVersion: "latest",
      "sauce:options": {
        tunnelName: sauceTunnelIdentifier
      }
    },
    sl_chrome_latest_i8n: {
      base: "SauceLabs",
      browserName: "chrome",
      browserVersion: "latest",
      "sauce:options": {
        tunnelName: sauceTunnelIdentifier
      },
      "goog:chromeOptions": {
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
      "sauce:options": {
        tunnelName: sauceTunnelIdentifier
      },
      "moz:debuggerAddress": true
    },
    sl_edge_latest: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      platformName: "Windows 10",
      browserVersion: "latest",
      "sauce:options": {
        tunnelName: sauceTunnelIdentifier
      }
    },
    // // Android is commented out because with the upgrade to SC5 I couldn't figure out how to get
    // // the Android VM to connect through the tunnel ("localhost" in the VM resolves to the VM
    // // itself, not the host machine). Maybe someone cleverer than me can figure this out.
    // sl_android_9: {
    //   base: "SauceLabs",
    //   browserName: "chrome",
    //   platformName: "Android",
    //   browserVersion: "latest",
    //   "appium:deviceName": "Android GoogleAPI Emulator",
    //   "appium:platformVersion": "9.0",
    //   "sauce:options": {
    //     tunnelName: sauceTunnelIdentifier
    //   }
    // },
    // sl_android_latest: {
    //   base: "SauceLabs",
    //   browserName: "chrome",
    //   platformName: "Android",
    //   browserVersion: "latest",
    //   "appium:deviceName": "Android GoogleAPI Emulator",
    //   "appium:platformVersion": "12.0",
    //   "sauce:options": {
    //     tunnelName: sauceTunnelIdentifier
    //   }
    // }
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
    region: sauceRegion,
    startConnect: !sauceTunnelIdentifier,
    connectOptions: {
      scVersion: sauceConnectVersion,
      tunnelIdentifier: sauceTunnelIdentifier
    }
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
