const dbFunctions = require('./dbFunctions');
const scaffolds = require('./scaffolds');

/*
 * Add locationTypeMetadata
 */

dbFunctions.addLocationTypeMetadataToDB(scaffolds.coffeeshops.locationType,
  scaffolds.coffeeshops.refreshTime,
  scaffolds.coffeeshops.scaffold,
  scaffolds.coffeeshops.scaffoldStructure,
  scaffolds.coffeeshops.queries,
  scaffolds.coffeeshops.queryAnswers);

dbFunctions.addLocationTypeMetadataToDB(scaffolds.gyms.locationType,
  scaffolds.gyms.refreshTime,
  scaffolds.gyms.scaffold,
  scaffolds.gyms.scaffoldStructure,
  scaffolds.gyms.queries,
  scaffolds.gyms.queryAnswers);

