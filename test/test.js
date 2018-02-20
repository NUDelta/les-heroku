const expect = require('chai').expect;
const notificationComposer = require('../cloud/notificationComposer.js');

describe('createMessageForGym()', () => {
  it('should return undefined since function is not declared', function () {
    // build up

    // modify
    let gymNotif = notificationComposer.fetchScaffoldedInformationForTag('gyms', {}, 'spac');

    // assert
    expect(gymNotif).to.be.equal(undefined);
  });
});