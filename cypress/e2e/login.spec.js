/// <reference types="cypress" />

describe('Login - Data-Driven (saucedemo.com)', () => {
  let users;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.visit(Cypress.env('SAUCEDEMO_URL'));
  });

  context('Valid credentials', () => {
    it('logs in successfully for every valid user in the fixture', () => {
      cy.fixture('users').then(({ validUsers }) => {
        validUsers.forEach((user) => {
          cy.log(`Scenario: ${user.scenario}`);
          cy.attemptLogin(user.username, user.password);
          cy.url().should('include', '/inventory.html');
          cy.get('.inventory_list').should('be.visible');
          cy.get('#react-burger-menu-btn').click();
          cy.get('#logout_sidebar_link').click();
        });
      });
    });

    it('supports a logged-in session via the custom cy.login command', () => {
      cy.login('standard_user', 'secret_sauce');
      cy.visit(`${Cypress.env('SAUCEDEMO_URL')}/inventory.html`);
      cy.get('.inventory_list').should('be.visible');
      cy.get('.title').should('have.text', 'Products');
    });
  });

  context('Invalid credentials', () => {
    it('shows the correct error message for every invalid case in the fixture', () => {
      cy.fixture('users').then(({ invalidUsers }) => {
        invalidUsers.forEach((user) => {
          cy.log(`Scenario: ${user.scenario}`);
          cy.attemptLogin(user.username, user.password);
          cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain.text', user.expectedMessage);
          cy.url().should('not.include', '/inventory.html');
        });
      });
    });
  });
});
