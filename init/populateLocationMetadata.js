const Parse = require('parse/node');
const dbFunctions = require('./dbFunctions');
const scaffolds = require('./scaffolds');

Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = process.env.SERVER_URL || 'http://localhost:5000/parse';

/*
 * Add locationTypeMetadata
 */

dbFunctions.addLocationTypeMetadataToDB(
  scaffolds.coffeeshops.locationType,
  scaffolds.coffeeshops.refreshTime,
  scaffolds.coffeeshops.scaffold,
  scaffolds.coffeeshops.scaffoldStructure,
  scaffolds.coffeeshops.loopbackQuestion,
  scaffolds.coffeeshops.queries,
  scaffolds.coffeeshops.queryAnswers);

dbFunctions.addLocationTypeMetadataToDB(
  scaffolds.gyms.locationType,
  scaffolds.gyms.refreshTime,
  scaffolds.gyms.scaffold,
  scaffolds.gyms.scaffoldStructure,
  scaffolds.gyms.loopbackQuestion,
  scaffolds.gyms.queries,
  scaffolds.gyms.queryAnswers);

dbFunctions.addLocationTypeMetadataToDB(
  scaffolds.workspaces.locationType,
  scaffolds.workspaces.refreshTime,
  scaffolds.workspaces.scaffold,
  scaffolds.workspaces.scaffoldStructure,
  scaffolds.workspaces.loopbackQuestion,
  scaffolds.workspaces.queries,
  scaffolds.workspaces.queryAnswers);

dbFunctions.addLocationTypeMetadataToDB(
  scaffolds.freefood.locationType,
  scaffolds.freefood.refreshTime,
  scaffolds.freefood.scaffold,
  scaffolds.freefood.scaffoldStructure,
  scaffolds.freefood.loopbackQuestion,
  scaffolds.freefood.queries,
  scaffolds.freefood.queryAnswers);