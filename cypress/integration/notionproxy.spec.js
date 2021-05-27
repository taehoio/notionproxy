/// <reference types="cypress" />

context('notionproxy', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('test', () => {
    cy.title().should('contain', '| TAEHO.IO');
    cy.get('.notion-title').should('contain', "Hello, I'm Taeho.");
  });
});
