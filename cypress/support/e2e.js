// ***********************************************************
// This file runs before every single spec file.
// See https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import 'cypress-mochawesome-reporter/register';

// demoqa.com has third-party ad iframes that occasionally throw uncaught
// exceptions unrelated to the app under test - don't let those fail specs.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('googletag') || err.message.includes('adsbygoogle')) {
    return false;
  }
  return true;
});
