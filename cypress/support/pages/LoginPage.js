class LoginPage {
  visit() {
    cy.visit('/login');
  }

  fillEmail(email) {
    cy.get('input[id="email"]').clear().type(email);
  }

  fillPassword(password) {
    cy.get('input[id="password"]').clear().type(password);
  }

  submit() {
    cy.get('button[type="submit"]').click();
  }

  getErrorAlert() {
    return cy.get('div[role="alert"]');
  }
}

export default new LoginPage();
