class RoomsPage {
  visit() {
    cy.visit('/rooms');
  }

  searchRoom(query) {
    cy.get('input[placeholder*="Cari"]').clear().type(query);
  }

  filterCategory(category) {
    cy.get('select').select(category);
  }

  getRoomCards() {
    return cy.get('.grid > div');
  }

  viewDetail(roomIndex = 0) {
    cy.get('.grid > div').eq(roomIndex).find('a').contains('Detail').click();
  }

  addToCart() {
    cy.get('button').contains('Pesan Kamar').click();
  }
}

export default new RoomsPage();
