// ***********************************************
// Custom Cypress commands.
// See https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Logs into saucedemo.com through the UI.
 * Centralizing this here means every spec that needs a logged-in state
 * calls cy.login(...) instead of repeating the same three lines everywhere -
 * and if the login form ever changes, there's exactly one place to fix it.
 *
 * @example cy.login('standard_user', 'secret_sauce')
 */
Cypress.Commands.add('login', (username, password) => {
  cy.session(
    [username, password],
    () => {
      cy.visit(Cypress.env('SAUCEDEMO_URL'));
      cy.get('#user-name').clear();
      if (username) cy.get('#user-name').type(username);
      cy.get('#password').clear();
      if (password) cy.get('#password').type(password);
      cy.get('#login-button').click();
    },
    {
      validate() {
        // Only treat the session as valid if we actually landed on the inventory page.
        cy.url().then((url) => {
          if (url.includes('/inventory.html')) {
            cy.get('.inventory_list').should('be.visible');
          }
        });
      },
      cacheAcrossSpecs: false,
    }
  );
});

/**
 * Same as cy.login but does NOT use cy.session - useful for negative-path
 * tests where the login is expected to fail and we want to assert the
 * error message on the login page itself.
 */
Cypress.Commands.add('attemptLogin', (username, password) => {
  cy.visit(Cypress.env('SAUCEDEMO_URL'));
  cy.get('#user-name').clear();
  if (username) cy.get('#user-name').type(username);
  cy.get('#password').clear();
  if (password) cy.get('#password').type(password);
  cy.get('#login-button').click();
});

/**
 * Adds N products to the saucedemo cart from the inventory page by index.
 * @example cy.addProductsToCart(2) // adds the first two products
 */
Cypress.Commands.add('addProductsToCart', (count = 1) => {
  cy.get('.inventory_item').should('have.length.greaterThan', 0);
  cy.get('.inventory_item')
    .find('button:contains("Add to cart")')
    .each(($btn, index) => {
      if (index < count) cy.wrap($btn).click();
    });
});

/**
 * Fills the demoqa.com Practice Form's required text fields.
 * Kept separate from file upload / dropdowns / date picker so individual
 * specs can compose only the pieces they need.
 */
Cypress.Commands.add('fillPracticeFormBasics', (data) => {
  if (data.firstName) cy.get('#firstName').type(data.firstName);
  if (data.lastName) cy.get('#lastName').type(data.lastName);
  if (data.email) cy.get('#userEmail').type(data.email);
  if (data.mobileNumber) cy.get('#userNumber').type(data.mobileNumber);
});

/** Selects a gender radio button on the demoqa Practice Form by label text. */
Cypress.Commands.add('selectGender', (gender) => {
  cy.contains('label', gender).click();
});

/** Picks a date of birth on the demoqa Practice Form's date picker widget. */
Cypress.Commands.add('setDateOfBirth', (day, month, year) => {
  cy.get('#dateOfBirthInput').click();
  cy.get('.react-datepicker__month-select').select(month);
  cy.get('.react-datepicker__year-select').select(year);
  cy.get(`.react-datepicker__day:not(.react-datepicker__day--outside-month)`)
    .contains(new RegExp(`^${day}$`))
    .click();
});

/** Types a subject into the demoqa Practice Form's subjects autocomplete and selects it. */
Cypress.Commands.add('addSubject', (subject) => {
  cy.get('#subjectsInput').type(subject.slice(0, 3));
  cy.get('.subjects-auto-complete__menu-list').contains(subject).click();
});

/** Checks a hobby checkbox by its visible label on the demoqa Practice Form. */
Cypress.Commands.add('checkHobby', (hobby) => {
  cy.contains('.custom-control-label', hobby).click();
});
