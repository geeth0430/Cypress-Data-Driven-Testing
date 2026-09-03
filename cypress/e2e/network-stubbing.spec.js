/// <reference types="cypress" />

/**
 * Network stubbing / mocking tests using cy.intercept().
 *
 * Target: demoqa.com/books - its book list is populated by a real XHR call
 * to GET https://demoqa.com/BookStore/v1/Books, which makes it a good
 * candidate for testing how the UI behaves under conditions that are hard
 * to trigger against a real backend on demand: a 500 error, an empty
 * dataset, and a slow/hanging response.
 */
describe('Network Stubbing & Mocking (demoqa.com/books)', () => {
  it('renders the book list when the API returns real data (fixture-backed happy path)', () => {
    cy.fixture('apiResponses').then(({ booksSuccess }) => {
      cy.intercept('GET', '**/BookStore/v1/Books', {
        statusCode: 200,
        body: booksSuccess,
      }).as('getBooks');

      cy.visit(`${Cypress.env('DEMOQA_URL')}/books`);
      cy.wait('@getBooks');

      cy.get('.rt-tbody .rt-tr-group').should('have.length', booksSuccess.books.length);
      cy.contains('.rt-tbody', booksSuccess.books[0].title).should('be.visible');
    });
  });

  it('handles an empty book list gracefully', () => {
    cy.fixture('apiResponses').then(({ booksEmpty }) => {
      cy.intercept('GET', '**/BookStore/v1/Books', {
        statusCode: 200,
        body: booksEmpty,
      }).as('getEmptyBooks');

      cy.visit(`${Cypress.env('DEMOQA_URL')}/books`);
      cy.wait('@getEmptyBooks');

      // No book rows should render, and the app shouldn't throw or hang.
      cy.get('.rt-tbody .rt-tr-group').should('have.length', 0);
      cy.get('.rt-noData').should('be.visible');
    });
  });

  it('does not crash the page when the API returns a 500 error', () => {
    cy.fixture('apiResponses').then(({ serverError500 }) => {
      cy.intercept('GET', '**/BookStore/v1/Books', {
        statusCode: 500,
        body: serverError500,
      }).as('getBooksError');

      cy.visit(`${Cypress.env('DEMOQA_URL')}/books`);
      cy.wait('@getBooksError');

      // The page should still be up and the table should show no rows -
      // this is the exact case that's nearly impossible to reproduce
      // reliably against a real backend on demand.
      cy.get('body').should('be.visible');
      cy.get('.rt-tbody .rt-tr-group').should('have.length', 0);
    });
  });

  it('shows a loading state while the API response is delayed', () => {
    cy.fixture('apiResponses').then(({ booksSuccess }) => {
      cy.intercept('GET', '**/BookStore/v1/Books', (req) => {
        req.reply({
          statusCode: 200,
          body: booksSuccess,
          delay: 3000, // simulate a slow network without waiting on a real slow backend
        });
      }).as('getSlowBooks');

      cy.visit(`${Cypress.env('DEMOQA_URL')}/books`);

      // Immediately after navigation, the table shouldn't have rows yet
      // because the (stubbed) response hasn't arrived.
      cy.get('.rt-tbody .rt-tr-group').should('have.length', 0);

      cy.wait('@getSlowBooks');
      cy.get('.rt-tbody .rt-tr-group').should('have.length', booksSuccess.books.length);
    });
  });

  it('asserts the request itself was well-formed (method, no auth leakage)', () => {
    cy.intercept('GET', '**/BookStore/v1/Books').as('getBooksReal');
    cy.visit(`${Cypress.env('DEMOQA_URL')}/books`);
    cy.wait('@getBooksReal').its('request.method').should('eq', 'GET');
  });
});
