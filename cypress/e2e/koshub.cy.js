import LoginPage from '../support/pages/LoginPage';
import RoomsPage from '../support/pages/RoomsPage';
import CartPage from '../support/pages/CartPage';
import CheckoutPage from '../support/pages/CheckoutPage';

describe('KosHub UI Automation Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('1. Login Fail - Empty fields show validation error', () => {
    LoginPage.visit();
    LoginPage.submit();
    cy.get('p').contains('Alamat email wajib diisi').should('be.visible');
    cy.get('p').contains('Kata sandi wajib diisi').should('be.visible');
  });

  it('2. Login Fail - Invalid credentials displays alert', () => {
    LoginPage.visit();
    LoginPage.fillEmail('user1@koshub.com');
    LoginPage.fillPassword('wrongpass');
    LoginPage.submit();
    LoginPage.getErrorAlert().should('contain', 'email atau password salah');
  });

  it('3. Login Success - Correct credentials redirects to dashboard', () => {
    LoginPage.visit();
    LoginPage.fillEmail('user1@koshub.com');
    LoginPage.fillPassword('user123');
    LoginPage.submit();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('span').contains('User Kesatu (user)').should('be.visible');
  });

  it('4. View Rooms - Displays room list from backend', () => {
    RoomsPage.visit();
    RoomsPage.getRoomCards().should('have.length.at.least', 1);
  });

  it('5. Search Rooms - Filter lists matching keyword', () => {
    RoomsPage.visit();
    RoomsPage.searchRoom('Deluxe');
    RoomsPage.getRoomCards().each(($el) => {
      cy.wrap($el).should('contain', 'Deluxe');
    });
  });

  it('6. View Room Detail - Displays full attributes and facilities', () => {
    RoomsPage.visit();
    RoomsPage.viewDetail(0);
    cy.url().should('include', '/rooms/');
    cy.get('h1').should('be.visible');
    cy.get('button').contains('Pesan Kamar').should('be.visible');
  });

  it('7. Add to Cart - Adding item updates header cart badge', () => {
    LoginPage.visit();
    LoginPage.fillEmail('user1@koshub.com');
    LoginPage.fillPassword('user123');
    LoginPage.submit();

    RoomsPage.visit();
    RoomsPage.viewDetail(0);
    RoomsPage.addToCart();
    
    cy.get('nav').find('.relative').should('contain', '1');
  });

  it('8. Checkout and Reservation Details', () => {
    LoginPage.visit();
    LoginPage.fillEmail('user1@koshub.com');
    LoginPage.fillPassword('user123');
    LoginPage.submit();

    CartPage.visit();
    CartPage.proceedToCheckout();

    CheckoutPage.fillRenterName('Asep Testing');
    CheckoutPage.fillRenterPhone('081234567890');
    CheckoutPage.fillRenterAddress('Bandung City');
    CheckoutPage.submitOrder();

    cy.url().should('include', '/reservations/');
    cy.get('h1').contains('Detail Reservasi').should('be.visible');
    cy.get('span').contains('DRAFT').should('be.visible');
  });
});
