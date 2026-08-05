class CheckoutPage {
  fillRenterName(name) {
    cy.get('input[name="nama_penyewa"]').clear().type(name);
  }

  fillRenterPhone(phone) {
    cy.get('input[name="nomor_telepon"]').clear().type(phone);
  }

  fillRenterAddress(address) {
    cy.get('textarea[name="alamat"]').clear().type(address);
  }

  submitOrder() {
    cy.get('button[type="submit"]').click();
  }
}

export default new CheckoutPage();
