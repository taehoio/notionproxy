/// <reference types="cypress" />

context('notionproxy', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('test', () => {
    cy.get('.notion-title').should('contain', "Hello, I'm Taeho.");
  });
});
