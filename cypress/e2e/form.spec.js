/// <reference types="cypress" />

describe('Practice Form (demoqa.com)', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('DEMOQA_URL')}/automation-practice-form`);
    // demoqa shows a fixed ad banner that can overlap form fields / the submit
    // button; hiding it keeps the test deterministic instead of scrolling around it.
    cy.get('#fixedban').invoke('css', 'display', 'none');
    cy.get('footer').invoke('css', 'display', 'none');
  });

  it('submits successfully with every field filled from the fixture', () => {
    cy.fixture('practiceFormData').then(({ validSubmission }) => {
      cy.fillPracticeFormBasics(validSubmission);
      cy.selectGender(validSubmission.gender);

      cy.setDateOfBirth(
        validSubmission.dateOfBirthDay,
        validSubmission.dateOfBirthMonth,
        validSubmission.dateOfBirthYear
      );

      validSubmission.subjects.forEach((subject) => cy.addSubject(subject));
      validSubmission.hobbies.forEach((hobby) => cy.checkHobby(hobby));

      cy.fixture(validSubmission.uploadFileName, null).then((fileContent) => {
        cy.get('#uploadPicture').selectFile(
          { contents: fileContent, fileName: validSubmission.uploadFileName },
          { force: true }
        );
      });

      cy.get('#state').click();
      cy.get('#react-select-3-input').type(`${validSubmission.state}{enter}`);
      cy.get('#city').click();
      cy.get('#react-select-4-input').type(`${validSubmission.city}{enter}`);

      cy.get('#currentAddress').type(validSubmission.currentAddress);

      cy.get('#submit').click();

      // Successful submission opens a modal summarizing the entered data.
      cy.get('.modal-content').should('be.visible');
      cy.get('#example-modal-sizes-title-lg').should('contain.text', 'Thanks for submitting the form');
      cy.get('.table-responsive').within(() => {
        cy.contains('td', `${validSubmission.firstName} ${validSubmission.lastName}`);
        cy.contains('td', validSubmission.email);
      });
    });
  });

  it('does not submit when required fields are missing', () => {
    cy.get('#submit').click();

    // demoqa marks empty required fields with a red outline via :invalid styling
    cy.get('#firstName').should('have.css', 'border-color', 'rgb(220, 53, 69)');
    cy.get('#lastName').should('have.css', 'border-color', 'rgb(220, 53, 69)');
    cy.get('.modal-content').should('not.exist');
  });

  it('rejects an invalid email format on submit', () => {
    cy.fixture('practiceFormData').then(({ validSubmission, invalidSubmission }) => {
      cy.get('#firstName').type(validSubmission.firstName);
      cy.get('#lastName').type(validSubmission.lastName);
      cy.get('#userEmail').type(invalidSubmission.invalidEmail);
      cy.selectGender(validSubmission.gender);
      cy.get('#userNumber').type(validSubmission.mobileNumber);

      cy.get('#submit').click();

      cy.get('#userEmail').should('have.css', 'border-color', 'rgb(220, 53, 69)');
      cy.get('.modal-content').should('not.exist');
    });
  });

  it('rejects a mobile number that is too short', () => {
    cy.fixture('practiceFormData').then(({ validSubmission, invalidSubmission }) => {
      cy.get('#firstName').type(validSubmission.firstName);
      cy.get('#lastName').type(validSubmission.lastName);
      cy.selectGender(validSubmission.gender);
      cy.get('#userNumber').type(invalidSubmission.invalidMobileNumber);

      cy.get('#submit').click();

      cy.get('#userNumber').should('have.css', 'border-color', 'rgb(220, 53, 69)');
      cy.get('.modal-content').should('not.exist');
    });
  });
});
