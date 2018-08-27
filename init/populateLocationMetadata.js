const dbFunctions = require('./dbFunctions');
const scaffolds = require('./scaffolds');

/**
 * Add locationTypeMetadata
 */
const populateLocationMetadata = function populateAllLocationMetadata() {
  dbFunctions.addLocationTypeMetadataToDB(
    scaffolds.coffeeshops.locationType,
    scaffolds.coffeeshops.refreshTime,
    scaffolds.coffeeshops.scaffold,
    scaffolds.coffeeshops.scaffoldStructure,
    scaffolds.coffeeshops.queryStructure,
    scaffolds.coffeeshops.loopbackQuestion,
    scaffolds.coffeeshops.queries,
    scaffolds.coffeeshops.queryAnswers);

  dbFunctions.addLocationTypeMetadataToDB(
    scaffolds.gyms.locationType,
    scaffolds.gyms.refreshTime,
    scaffolds.gyms.scaffold,
    scaffolds.gyms.scaffoldStructure,
    scaffolds.gyms.queryStructure,
    scaffolds.gyms.loopbackQuestion,
    scaffolds.gyms.queries,
    scaffolds.gyms.queryAnswers);

  dbFunctions.addLocationTypeMetadataToDB(
    scaffolds.workspaces.locationType,
    scaffolds.workspaces.refreshTime,
    scaffolds.workspaces.scaffold,
    scaffolds.workspaces.scaffoldStructure,
    scaffolds.workspaces.queryStructure,
    scaffolds.workspaces.loopbackQuestion,
    scaffolds.workspaces.queries,
    scaffolds.workspaces.queryAnswers);

  dbFunctions.addLocationTypeMetadataToDB(
    scaffolds.freefood.locationType,
    scaffolds.freefood.refreshTime,
    scaffolds.freefood.scaffold,
    scaffolds.freefood.scaffoldStructure,
    scaffolds.freefood.queryStructure,
    scaffolds.freefood.loopbackQuestion,
    scaffolds.freefood.queries,
    scaffolds.freefood.queryAnswers);
};

module.exports = {
  populateLocationMetadata: populateLocationMetadata
};