/* eslint-disable max-len */
// create scaffolds for each question class
let coffeeshops = {
  'tag': 'coffeeshops',
  'refreshTime': 2 * 60 * 60, // 2 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'smalltables': '',
    'smalltableswindows': '',
    'smalltablesoutlets': '',
    'smalltablesnoise': '',
    'largetables': '',
    'largetableswindows': '',
    'largetablesoutlets': '',
    'largetablesnoise': ''
  },
  'questions': {
    'smalltables': 'Do you see tables or couches/chairs available for 1-2 people to work at?',
    'smalltableswindows': 'Are any of these near the windows?',
    'smalltablesoutlets': 'Are they near outlets?',
    'smalltablesnoise': 'We were wondering if this is a good time to work here. How loud is the place?',
    'largetables': ' Do you see larger tables fit for more than 2 people to work together at?',
    'largetableswindows': 'Are any of these near the windows? ',
    'largetablesoutlets': 'Are they near outlets?',
    'largetablesnoise': 'We were wondering if this is a good time to work here. How loud is the place?'
  },
  'answers': {
    'smalltables': ['yes, tables', 'yes, couches/chairs', 'yes, both', 'no'],
    'smalltableswindows': ['yes', 'no'],
    'smalltablesoutlets': ['yes', 'no'],
    'smalltablesnoise': ['loud', 'light conversation', 'very quiet'],
    'largetables': ['yes: groups of 2-4 people', 'yes: groups of 4-6 people', 'no'],
    'largetableswindows': ['yes', 'no'],
    'largetablesoutlets': ['yes', 'no'],
    'largetablesnoise': ['loud', 'light conversation', 'very quiet']
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
    'grouptables': ['yes: groups of 2-4 people', 'yes, groups of 4-6 people', 'no'],
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
    'dumbells': '',
    'dumbellsbenches': '',
    'stretch': '',
    'stretchmats': '',
    'stretchroller': '',
    'basketballcourts': ''
  },
  'questions': {
    'cardio': 'Is there cardio equipment available currently?',
    'treadmills': 'Can you tell us if there are treadmills available currently?',
    'ellipticalbike': 'Can you tell us if there are ellipticals or bikes available currently?',
    'freeweights': 'Are there any free weights available currently?',
    'benches': 'Do you see benches with barbells available?',
    'squatracks': 'Do you see any squat racks available?',
    'dumbells': 'Are there any dumbbells available?',
    'dumbellsbenches': 'Do you see any benches that can be used with them?',
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
    'dumbells': ['yes', 'no'],
    'dumbellsbenches': ['yes', 'no'],
    'stretch': ['yes', 'no'],
    'stretchmats': ['yes', 'no'],
    'stretchroller': ['yes', 'no'],
    'basketballcourts': ['yes', 'no', 'no courts here']
  }
};

let food = {
  'tag': 'food',
  'refreshTime': 2 * 60 * 60, // 1 hr * 60 mins/hr * 60 seconds/min
  'info': {
    'type': '',
    'quantity': '',
    'freesold': '',
    'cost': '',
    'sellingreason': ''
  },
  'questions': {
    'type': 'What kind of food is here?',
    'quantity': 'How much is left?',
    'freesold': 'Is it free or sold?',
    'cost': 'How much does it cost per unit?',
    'sellingreason': 'Why is it being sold?'
  },
  'answers': {
    'type': ['pizza', 'buns', 'pastries/sweets/candy', 'other'],
    'quantity': ['lots, plenty to go around',  'some, going quickly',  'very little, only couple items left', 'none'],
    'freesold': ['free', 'sold'],
    'cost': ['< $2', '$2-4',  '$5+'],
    'sellingreason': ['charity', 'student group fundraising', 'other']
  }
};
