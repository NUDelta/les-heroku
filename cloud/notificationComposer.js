/* eslint-disable max-len */
/* eslint-disable block-scoped-var */
/* eslint-disable max-statements */
/* eslint-disable max-depth */

// create scaffolds for each question class
let coffeeshops = {
  'tag': 'coffeeshops',
  'refreshTime': 2 * 60 * 60, // 2 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'smalltables': '',
    'smalltableswindows': '',
    'smalltablesoutlets': '',
    'largetables': '',
    'largetableswindows': '',
    'largetablesoutlets': '',
    'noiselevel': ''
  },
  'questionTag': {
    'smalltables': 'smalltables',
    'smalltableswindows': 'smalltableswindows',
    'smalltablesoutlets': 'smalltablesoutlets',
    'largetables': 'largetables',
    'largetableswindows': 'largetableswindows',
    'largetablesoutlets': 'largetablesoutlets',
    'noiselevel': 'noiselevel'
  },
  'questions': {
    'smalltables': 'Do you see tables or couches/chairs available for 1-2 people to work at?',
    'smalltableswindows': 'Are any of these near the windows?',
    'smalltablesoutlets': 'Are they near outlets?',
    'largetables': 'Do you see larger tables fit for more than 2 people to work together at?',
    'largetableswindows': 'Are any of these near the windows? ',
    'largetablesoutlets': 'Are they near outlets?',
    'noiselevel': 'We were wondering if this is a good time to work here. How loud is the place?'
  },
  'answers': {
    'smalltables': ['yes, tables', 'yes, couches/chairs', 'yes, both', 'no'],
    'smalltableswindows': ['yes', 'no'],
    'smalltablesoutlets': ['yes', 'no'],
    'largetables': ['yes: groups of 2-4 people', 'yes: groups of 4-6 people', 'no'],
    'largetableswindows': ['yes', 'no'],
    'largetablesoutlets': ['yes', 'no'],
    'noiselevel': ['loud', 'light conversation', 'very quiet']
  }
};

let workspaces = {
  'tag': 'workspaces',
  'refreshTime': 3 * 60 * 60, // 3 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'tablesavailable': '',
    'tabletype': '',
    'tabletypeoutlets': '',
    'grouptables': '',
    'grouptablesoutlet': '',
    'monitorscomps': '',
    'monitorscompsdongles': '',
    'whiteboards': '',
    'whiteboardsmarkers': ''
  },
  'questionTag': {
    'tablesavailable': 'tablesavailable',
    'tabletype': 'tabletype',
    'tabletypeoutlets': 'tabletypeoutlets',
    'grouptables': 'grouptables',
    'grouptablesoutlet': 'grouptablesoutlet',
    'monitorscomps': 'monitorscomps',
    'monitorscompsdongles': 'monitorscompsdongles',
    'whiteboards': 'whiteboards',
    'whiteboardsmarkers': 'whiteboardsmarkers'
  },
  'questions': {
    'tablesavailable': 'Are there any tables or desks available to sit down and work?',
    'tabletype': 'What kind of tables are available?',
    'tabletypeoutlets': 'Are they near outlets?',
    'grouptables': 'Are the tables available large enough for groups of people to work at them?',
    'grouptablesoutlet': 'Are they near outlets?',
    'monitorscomps': 'If this place has computers or monitors available for student use, are there any available right now?',
    'monitorscompsdongles': 'For the monitors available, are dongles and cables present for use?',
    'whiteboards': 'If this place has whiteboards to write on, are there any available right now?',
    'whiteboardsmarkers': 'Can you tell us if there are any dry erase markers nearby that you can borrow?'
  },
  'answers': {
    'tablesavailable': ['yes', 'no'],
    'tabletype': ['communal tables',  'private tables', 'both', 'no more tables'],
    'tabletypeoutlets': ['yes', 'no'],
    'grouptables': ['yes: groups of 2-4 people', 'yes: groups of 4-6 people', 'no'],
    'grouptablesoutlet': ['yes', 'no'],
    'monitorscomps': ['yes, monitors', 'yes, computers', 'yes, both', 'none available', 'none here'],
    'monitorscompsdongles': ['yes', 'no'],
    'whiteboards': ['yes', 'no'],
    'whiteboardsmarkers': ['yes', 'no']
  }
};

let cafes = {
  'tag': 'cafes',
  'refreshTime': 30 * 60, // 30 mins/hr * 60 seconds/min
  'info': {
    'linelength': '',
    'tables': '',
    'specials': '',
    'specialsdaily': '',
    'specialsvegetarian': ''
  },
  'questionTag': {
    'linelength': 'linelength',
    'tables': 'tables',
    'specials': 'specials',
    'specialsdaily': 'specialsdaily',
    'specialsvegetarian': 'specialsvegetarian'
  },
  'questions': {
    'linelength': 'How long is the line here currently?',
    'tables': 'Are there any tables here where customers can eat?',
    'specials': 'Can you tell us if there are any food specials available?',
    'specialsdaily': 'Are these daily specials or more seasonal specials?',
    'specialsvegetarian': ' For the specials available, are there vegetarian options available?'
  },
  'answers': {
    'linelength': ['short: < 5 people', 'medium: 5-10 people', 'long: 10+ people'],
    'tables': ['small tables, 1-4 people', 'larger tables: 5-8 people', 'small and large tables', 'none'],
    'specials': ['yes', 'no'],
    'specialsdaily': ['daily', 'seasonal'],
    'specialsvegetarian': ['yes', 'no']
  }
};

let gyms = {
  'tag': 'gyms',
  'refreshTime': 1 * 60 * 60, // 1 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'cardio': '',
    'treadmills': '',
    'ellipticalbike': '',
    'freeweights': '',
    'benches': '',
    'squatracks': '',
    'dumbbells': '',
    'dumbbellsbenches': '',
    'stretch': '',
    'stretchmats': '',
    'stretchroller': '',
    'basketballcourts': ''
  },
  'questionTag': {
    'cardio': 'cardio',
    'treadmills': 'treadmills',
    'ellipticalbike': 'ellipticalbike',
    'freeweights': 'freeweights',
    'benches': 'benches',
    'squatracks': 'squatracks',
    'dumbbells': 'dumbbells',
    'dumbbellsbenches': 'dumbbellsbenches',
    'stretch': 'stretch',
    'stretchmats': 'stretchmats',
    'stretchroller': 'stretchroller',
    'basketballcourts': 'basketballcourts'
  },
  'questions': {
    'cardio': 'Is there cardio equipment available currently?',
    'treadmills': 'Can you tell us if there are treadmills available currently?',
    'ellipticalbike': 'Can you tell us if there are ellipticals or bikes available currently?',
    'freeweights': 'Are there any free weights available currently?',
    'benches': 'Do you see benches with barbells available?',
    'squatracks': 'Do you see any squat racks available?',
    'dumbbells': 'Are there any dumbbells available?',
    'dumbbellsbenches': 'Do you see any benches that can be used with them?',
    'stretch': 'Is there space to stretch available currently?',
    'stretchmats': 'Are there mats available?',
    'stretchroller': 'Are there any rollers available to use?',
    'basketballcourts': 'Are there courts available to play basketball?'
  },
  'answers': {
    'cardio': ['yes', 'no'],
    'treadmills': ['yes', 'no'],
    'ellipticalbike': ['yes', 'no'],
    'freeweights': ['yes', 'no'],
    'benches': ['yes', 'no'],
    'squatracks': ['yes', 'no'],
    'dumbbells': ['yes', 'no'],
    'dumbbellsbenches': ['yes', 'no'],
    'stretch': ['yes', 'no'],
    'stretchmats': ['yes', 'no'],
    'stretchroller': ['yes', 'no'],
    'basketballcourts': ['yes', 'no', 'no courts here']
  }
};

let food = {
  'tag': 'food',
  'refreshTime': 2 * 60 * 60, // 2 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'type': '',
    'quantity': '',
    'freesold': '',
    'cost': '',
    'sellingreason': ''
  },
  'questionTag': {
    'type': 'type',
    'quantity': 'quantity',
    'freesold': 'freesold',
    'cost': 'cost',
    'sellingreason': 'sellingreason'
  },
  'questions': {
    'type': 'What kind of food is here?',
    'quantity': 'How much is left?',
    'freesold': 'Is it free or sold?',
    'cost': 'How much does it cost per unit?',
    'sellingreason': 'Why is it being sold?'
  },
  'answers': {
    'type': ['pizzas', 'buns', 'pastries/sweets/candy', 'other'],
    'quantity': ['lots, plenty to go around',  'some, going quickly',  'very little, only couple items left', 'none'],
    'freesold': ['free', 'sold'],
    'cost': ['< $2', '$2-4',  '$5+'],
    'sellingreason': ['charity', 'student group fundraising', 'other']
  }
};

// create notification generators
exports.createNotificationForTag = function(tag, currentInfo, locationCommonName) {
  switch (tag) {
    case 'coffeeshops':
      return createNotificationForCoffeeshops(currentInfo, locationCommonName);
      break;
    case 'workspaces':
      return createNotificationForWorkspaces(currentInfo, locationCommonName);
      break;
    case 'cafes':
      return createNotificationForCafes(currentInfo, locationCommonName);
      break;
    case 'gyms':
      return createNotificationForGyms(currentInfo, locationCommonName);
      break;
    case 'food':
      return createNotificationForFood(currentInfo, locationCommonName);
      break;
    default:
      return undefined;
  }
};

function createNotificationForCoffeeshops(currentInfo, locationCommonName) {
  let locationPhrase = (locationCommonName === '') ? 'here' : 'in ' + locationCommonName;
  var output = {
    'notificationCategory': '', // classtag_questiontag
    'message': '', // notification message to present
    'contextualResponses': [] // responses for contextual handler
  };

  // check for small tables and return when at a node with no information
  if (currentInfo.smalltables === '') {
    output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.smalltables;
    output.message = 'Do you see tables or couches/chairs available for 1-2 people to work at ' + locationPhrase + '?';
    output.contextualResponses = coffeeshops.answers.smalltables;
    return output;
  } else if (currentInfo.smalltables !== 'no') {
    var tableType = '';
    switch (currentInfo.smalltables) {
      case 'yes, tables':
        tableType = 'small tables';
        break;
      case 'yes, couches/chairs':
        tableType = 'couches/chairs';
        break;
      case 'yes, both':
        tableType = 'both small tables and couches/chairs';
        break;
      default:
        break;
    }

    var currentMessage = 'There are currently ' + tableType + ' available ' + locationPhrase + '.';
    if (currentInfo.smalltableswindows === '') {
      output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.smalltableswindows;
      output.message = currentMessage + ' Are any of these near the windows?';
      output.contextualResponses = coffeeshops.answers.smalltableswindows;
      return output;
    } else if (currentInfo.smalltablesoutlets === '') {
      output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.smalltablesoutlets;
      output.message = currentMessage + ' Are any of these near outlets?';
      output.contextualResponses = coffeeshops.answers.smalltablesoutlets;
      return output;
    }
  }

  // check for large tables and return when at a node with no information
  if (currentInfo.largetables === '') {
    output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.largetables;
    output.message = 'Do you see larger tables fit for more than 2 people to work together ' + locationPhrase + '?';
    output.contextualResponses = coffeeshops.answers.largetables;
    return output;
  } else if (currentInfo.largetables !== 'no') {
    var tableType = '';
    switch (currentInfo.largetables) {
      case 'yes: groups of 2-4 people':
        tableType = 'groups of 2-4 people';
        break;
      case 'yes: groups of 4-6 people':
        tableType = 'groups of 4-6 people';
        break;
      default:
        break;
    }

    var currentMessage = 'There are currently tables for ' + tableType + ' available ' + locationPhrase + '.';
    if (currentInfo.largetableswindows === '') {
      output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.largetableswindows;
      output.message = currentMessage + ' Are any of these near the windows?';
      output.contextualResponses = coffeeshops.answers.largetableswindows;
      return output;
    } else if (currentInfo.largetablesoutlets === '') {
      output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.largetablesoutlets;
      output.message = currentMessage + ' Are any of these near outlets?';
      output.contextualResponses = coffeeshops.answers.largetablesoutlets;
      return output;
    }
  }

  // check for noise level
  if (currentInfo.noiselevel === '') {
   output.notificationCategory = coffeeshops.tag + '_' + coffeeshops.questionTag.noiselevel;
   output.message = 'We were wondering if this is a good time to work ' + locationPhrase + '. How loud is the place?';
   output.contextualResponses = coffeeshops.answers.noiselevel;
   return output;
 }

  // return a default undefined if there's nothing to ask
  return undefined;
};

function createNotificationForWorkspaces(currentInfo, locationCommonName) {
  let locationPhrase = (locationCommonName === '') ? 'here' : 'in ' + locationCommonName;
  var output = {
    'notificationCategory': '', // classtag_questiontag
    'message': '', // notification message to present
    'contextualResponses': [] // responses for contextual handler
  };

  // check for table availability
  if (currentInfo.tablesavailable === '') {
    output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.tablesavailable;
    output.message = 'Are there any tables or desks available to sit down and work ' + locationPhrase + '?';
    output.contextualResponses = workspaces.answers.tablesavailable;
    return output;
  } else if (currentInfo.tablesavailable === 'yes') {
    // smaller tables
    if (currentInfo.tabletype === '') {
      output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.tabletype;
      output.message = 'Looks like there might be some tables to use ' + locationPhrase + '. What kind of tables are available?';
      output.contextualResponses = workspaces.answers.tabletype;
      return output;
    } else if (currentInfo.tabletype !== 'no more tables') {
      var tableType = (currentInfo.tabletype === 'both') ? 'communal and private tables' : currentInfo.tabletype;

      var currentMessage = 'There are currently ' + tableType + ' tables available ' + locationPhrase + '.';
      if (currentInfo.tabletypeoutlets === '') {
        output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.tabletypeoutlets;
        output.message = currentMessage + ' Are any of these near outlets?';
        output.contextualResponses = workspaces.answers.tabletypeoutlets;
        return output;
      }
    }

    // larger tables
    if (currentInfo.grouptables === '') {
      output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.grouptables;
      output.message = 'Looks like there might be some tables to use ' + locationPhrase + '. Are any large enough for groups of people to work at them?';
      output.contextualResponses = workspaces.answers.grouptables;
      return output;
    } else if (currentInfo.grouptables !== 'no') {
      var tableType = (currentInfo.grouptables === 'yes: groups of 2-4 people') ? '2-4' : '4-6';

      var currentMessage = 'There are currently tables for ' + tableType + ' people available ' + locationPhrase + '.';
      if (currentInfo.grouptablesoutlet === '') {
        output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.grouptablesoutlet;
        output.message = currentMessage + ' Are any of these near outlets?';
        output.contextualResponses = workspaces.answers.grouptablesoutlet;
        return output;
      }
    }
  }

  // check for computer or monitor availability
  if (currentInfo.monitorscomps === '') {
    output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.monitorscomps;
    output.message = 'If computers or monitors available for student use ' + locationPhrase + ' are there any available right now?';
    output.contextualResponses = workspaces.answers.monitorscomps;
    return output;
  } else if (currentInfo.monitorscomps === 'yes, monitors' || currentInfo.monitorscomps === 'yes, both') {
    if (currentInfo.monitorscompsdongles === '') {
      output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.monitorscompsdongles;
      output.message = 'Looks like there are monitors available  ' + locationPhrase + '! Do you see dongle and cables available present for use?';
      output.contextualResponses = workspaces.answers.monitorscompsdongles;
      return output;
    }
  }

  // check for whiteboards availability
  if (currentInfo.whiteboards === '') {
    output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.whiteboards;
    output.message = 'If there are whiteboards ' + locationPhrase + ' to write on, are there any available right now?';
    output.contextualResponses = workspaces.answers.whiteboards;
    return output;
  } else if (currentInfo.whiteboards === 'yes') {
    if (currentInfo.whiteboardsmarkers === '') {
      output.notificationCategory = workspaces.tag + '_' + workspaces.questionTag.whiteboardsmarkers;
      output.message = 'Looks like there are whiteboards ' + locationPhrase + ' to work on! Are there any dry erase markers nearby that you can borrow?';
      output.contextualResponses = workspaces.answers.whiteboardsmarkers;
      return output;
    }
  }

  // return a default undefined if there's nothing to ask
  return undefined;
};

function createNotificationForCafes(currentInfo, locationCommonName) {
  let locationPhrase = (locationCommonName === '') ? 'here' : 'in ' + locationCommonName;
  var output = {
    'notificationCategory': '', // classtag_questiontag
    'message': '', // notification message to present
    'contextualResponses': [] // responses for contextual handler
  };

  // check for line length
  if (currentInfo.linelength === '') {
    output.notificationCategory = cafes.tag + '_' + cafes.questionTag.linelength;
    output.message = 'How long is the line ' + locationPhrase + ' currently?';
    output.contextualResponses = cafes.answers.linelength;
    return output;
  }

  // check for table availability
  if (currentInfo.tables === '') {
    output.notificationCategory = cafes.tag + '_' + cafes.questionTag.tables;
    output.message = 'Are there any tables ' + locationPhrase + ' where customers can eat?';
    output.contextualResponses = cafes.answers.tables;
    return output;
  }

  // check for specials
  if (currentInfo.specials === '') {
    output.notificationCategory = cafes.tag + '_' + cafes.questionTag.specials;
    output.message = 'Are there any specials available ' + locationPhrase + ' today?';
    output.contextualResponses = cafes.answers.specials;
    return output;
  } else if (currentInfo.specials === 'yes') {
    if (currentInfo.specialsdaily === '') {
      output.notificationCategory = cafes.tag + '_' + cafes.questionTag.specialsdaily;
      output.message = 'There is a special available ' + locationPhrase + ' today! Can you tell us if it is a daily or seasonal special?';
      output.contextualResponses = cafes.answers.specialsdaily;
      return output;
    } else if (currentInfo.specialsvegetarian === '') {
      output.notificationCategory = cafes.tag + '_' + cafes.questionTag.specialsvegetarian;
      output.message = 'There is a special available ' + locationPhrase + ' today! Is it vegetarian friendly?';
      output.contextualResponses = cafes.answers.specialsvegetarian;
      return output;
    }
  }

  // return a default undefined if there's nothing to ask
  return undefined;
};

function createNotificationForGyms(currentInfo, locationCommonName) {
  let locationPhrase = (locationCommonName === '') ? 'here' : 'in ' + locationCommonName;
  var output = {
    'notificationCategory': '', // classtag_questiontag
    'message': '', // notification message to present
    'contextualResponses': [] // responses for contextual handler
  };

  // cardio equipment
  if (currentInfo.cardio === '') {
    output.notificationCategory = gyms.tag + '_' + gyms.questionTag.cardio;
    output.message = 'Are there cardio machines currently available ' + locationPhrase + '?';
    output.contextualResponses = gyms.answers.cardio;
    return output;
  } else if (currentInfo.cardio === 'yes') {
    if (currentInfo.treadmills === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.treadmills;
      output.message = 'Are there treadmill machines currently available ' + locationPhrase + '?';
      output.contextualResponses = gyms.answers.treadmills;
      return output;
    } else if (currentInfo.ellipticalbike === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.ellipticalbike;
      output.message = 'Are there elliptical machines or bikes currently available ' + locationPhrase + '?';
      output.contextualResponses = gyms.answers.ellipticalbike;
      return output;
    }
  }

  // free weights
  if (currentInfo.freeweights === '') {
    output.notificationCategory = gyms.tag + '_' + gyms.questionTag.freeweights;
    output.message = 'Are there free weights currently available ' + locationPhrase + '?';
    output.contextualResponses = gyms.answers.freeweights;
    return output;
  } else if (currentInfo.freeweights === 'yes') {
    if (currentInfo.benches === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.benches;
      output.message = 'Do you see benches with barbells currently available ' + locationPhrase + '?';
      output.contextualResponses = gyms.answers.benches;
      return output;
    } else if (currentInfo.squatracks === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.squatracks;
      output.message = 'Do you see squat racks with barbells currently available ' + locationPhrase + '?';
      output.contextualResponses = gyms.answers.squatracks;
      return output;
    } else if (currentInfo.dumbbells === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.dumbbells;
      output.message = 'Do you see dumbbells currently available ' + locationPhrase + '?';
      output.contextualResponses = gyms.answers.dumbbells;
      return output;
    } else if (currentInfo.dumbbells === 'yes') {
      if (currentInfo.dumbbellsbenches === '') {
        output.notificationCategory = gyms.tag + '_' + gyms.questionTag.dumbbellsbenches;
        output.message = 'There are dumbbells currently available ' + locationPhrase + '! Are there any benches available to use with them?';
        output.contextualResponses = gyms.answers.dumbbellsbenches;
        return output;
      }
    }
  }

  // stretching space
  if (currentInfo.stretch === '') {
    output.notificationCategory = gyms.tag + '_' + gyms.questionTag.stretch;
    output.message = 'Is there space to stretch ' + locationPhrase + ' currently available?';
    output.contextualResponses = gyms.answers.stretch;
    return output;
  } else if (currentInfo.stretch === 'yes') {
    if (currentInfo.stretchmats === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.stretchmats;
      output.message = 'There is currently stretching space available ' + locationPhrase + '! Are there also mats available?';
      output.contextualResponses = gyms.answers.stretchmats;
      return output;
    } else if (currentInfo.stretchroller === '') {
      output.notificationCategory = gyms.tag + '_' + gyms.questionTag.stretchroller;
      output.message = 'There is currently stretching space available ' + locationPhrase + '! Are there also rollers available?';
      output.contextualResponses = gyms.answers.stretchroller;
      return output;
    }
  }

  // basketball courts
  if (currentInfo.basketballcourts === '') {
    output.notificationCategory = gyms.tag + '_' + gyms.questionTag.basketballcourts;
    output.message = 'Are there any courts available ' + locationPhrase + ' to play basketball?';
    output.contextualResponses = gyms.answers.basketballcourts;
    return output;
  }

  // return a default undefined if there's nothing to ask
  return undefined;
};

function createNotificationForFood(currentInfo, locationCommonName) {
  let locationPhrase = (locationCommonName === '') ? 'here' : 'in ' + locationCommonName;
  var output = {
    'notificationCategory': '', // classtag_questiontag
    'message': '', // notification message to present
    'contextualResponses': [] // responses for contextual handler
  };

  if (currentInfo.type === '') {
    output.notificationCategory = food.tag + '_' + food.questionTag.type;
    output.message = 'There is food ' + locationPhrase + '! Do you know what kind it is?';
    output.contextualResponses = food.answers.type;
    return output;
  } else if (currentInfo.type !== '') {
    var currentMessage = '';
    if (currentInfo.type !== 'other') {
      currentMessage = 'There are ' + currentInfo.type + ' ' + locationPhrase + '!';
    } else {
      currentMessage = 'There is some kind of food ' + locationPhrase + '!';
    }

    if (currentInfo.quantity === '') {
      output.notificationCategory = food.tag + '_' + food.questionTag.quantity;
      output.message = currentMessage + ' Do you know how much is left?';
      output.contextualResponses = food.answers.quantity;
      return output;
    } else if (currentInfo.quantity !== 'none') {
      if (currentInfo.freesold === '') {
        output.notificationCategory = food.tag + '_' + food.questionTag.freesold;
        output.message = currentMessage + ' Do you know if it is free or being sold?';
        output.contextualResponses = food.answers.freesold;
        return output;
      } else if (currentInfo.freesold === 'sold') {
        if (currentInfo.cost === '') {
          output.notificationCategory = food.tag + '_' + food.questionTag.cost;
          output.message = currentMessage + ' Do you know how much it is being sold for?';
          output.contextualResponses = food.answers.cost;
          return output;
        } else if (currentInfo.sellingreason === '') {
          output.notificationCategory = food.tag + '_' + food.questionTag.sellingreason;
          output.message = currentMessage + ' Do you know why the food is being sold?';
          output.contextualResponses = food.answers.sellingreason;
          return output;
        }
      }
    }
  }

  // return a default undefined if there's nothing to ask
  return undefined;
};
