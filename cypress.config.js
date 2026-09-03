const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // No single baseUrl - this suite intentionally covers two demo sites
    // (saucedemo.com for login/cart, demoqa.com for forms + API mocking).
    // Each spec calls cy.visit() with a full URL instead.
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    specPattern: 'cypress/e2e/**/*.spec.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      SAUCEDEMO_URL: 'https://www.saucedemo.com',
      DEMOQA_URL: 'https://demoqa.com',
    },
  },

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/html',
    charts: true,
    reportPageTitle: 'Cypress Data-Driven Testing Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: false,
  },
});
