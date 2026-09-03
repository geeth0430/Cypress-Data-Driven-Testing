/// <reference types="cypress" />

describe('Cart & Checkout (saucedemo.com)', () => {
  beforeEach(() => {
    cy.login('standard_user', 'secret_sauce');
    cy.visit(`${Cypress.env('SAUCEDEMO_URL')}/inventory.html`);
  });

  it('adds products to the cart and updates the cart badge', () => {
    cy.addProductsToCart(2);
    cy.get('.shopping_cart_badge').should('have.text', '2');
  });

  it('shows the correct items on the cart page after adding them', () => {
    cy.get('.inventory_item')
      .first()
      .find('.inventory_item_name')
      .invoke('text')
      .then((productName) => {
        cy.get('.inventory_item').first().find('button:contains("Add to cart")').click();
        cy.get('.shopping_cart_link').click();
        cy.get('.cart_item').should('have.length', 1);
        cy.get('.inventory_item_name').should('have.text', productName);
      });
  });

  it('removes an item from the cart', () => {
    cy.addProductsToCart(1);
    cy.get('.shopping_cart_link').click();
    cy.get('.cart_item').should('have.length', 1);
    cy.get('button:contains("Remove")').click();
    cy.get('.cart_item').should('have.length', 0);
  });

  it('completes checkout end-to-end and shows the order confirmation', () => {
    cy.addProductsToCart(1);
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="checkout"]').click();

    cy.get('[data-test="firstName"]').type('Ada');
    cy.get('[data-test="lastName"]').type('Lovelace');
    cy.get('[data-test="postalCode"]').type('10001');
    cy.get('[data-test="continue"]').click();

    cy.get('.summary_info').should('be.visible');
    cy.get('[data-test="finish"]').click();

    cy.get('.complete-header').should('contain.text', 'Thank you for your order!');
  });

  it('blocks checkout when required customer-info fields are empty', () => {
    cy.addProductsToCart(1);
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="continue"]').click();

    cy.get('[data-test="error"]')
      .should('be.visible')
      .and('contain.text', 'First Name is required');
  });
});
