class CartPage {
  visit() {
    cy.visit('/cart');
  }

  getCartItems() {
    return cy.get('.grid > .space-y-4 > div');
  }

  increaseQuantity(index = 0) {
    cy.get('.grid > .space-y-4 > div').eq(index).find('button').contains('+').click();
  }

  decreaseQuantity(index = 0) {
    cy.get('.grid > .space-y-4 > div').eq(index).find('button').contains('-').click();
  }

  proceedToCheckout() {
    cy.get('a').contains('Lanjutkan ke Checkout').click();
  }
}

export default new CartPage();
