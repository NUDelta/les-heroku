const coffeeshops = {
  locationType: 'coffeeshop',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    privateseating: '',
    privateseatingoutlets: '',
    privateseatingwindows: '',
    sharedseating: '',
    sharedseatingoutlets: '',
    sharedseatingwindows: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is',
    suffixText: ', available at {{locationname}}.',
    joinText: ', and also ',
    components: [
      {
        key: 'privateseating',
        prefixText: 'private seating ({{privateseating}})',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'privateseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          },
          {
            key: 'privateseatingwindows',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'windows'
          }
        ]
      },
      {
        key: 'sharedseating',
        prefixText: 'shared seating (communal tables)',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'sharedseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          },
          {
            key: 'sharedseatingwindows',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'windows'
          }
        ]
      }
    ]
  },
  queries: {
    privateseating: 'Do you see private seating (individual tables/chairs) available at {{locationname}}?',
    privateseatingoutlets: 'Do you see private seating (individual tables/chairs) near outlets at {{locationname}}?',
    privateseatingwindows: 'Do you see private seating (individual tables/chairs) near the windows at {{locationname}}?',
    sharedseating: 'Do you see shared seating (communal tables) available at {{locationname}}?',
    sharedseatingoutlets: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
    sharedseatingwindows: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
  },
  queryAnswers: {
    privateseating: ['tables', 'couches/chairs', 'tables and couches/chairs', 'no'],
    privateseatingoutlets: ['yes', 'no'],
    privateseatingwindows: ['yes', 'no'],
    sharedseating: ['yes', 'no'],
    sharedseatingoutlets: ['yes', 'no'],
    sharedseatingwindows: ['yes', 'no']
  },
};

const gyms = {
  locationType: 'gym',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    treadmills: '',
    ellipticals: '',
    freeweights: '',
    freeweightsbenches: '',
    freeweightssquatracks: '',
    stretch: '',
    stretchmats: '',
    stretchrollers: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There are',
    suffixText: 'available at {{locationname}}.',
    joinText: '/',
    components: [
      {
        key: 'treadmills',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: 'treadmills'
      },
      {
        key: 'ellipticals',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: 'ellipticals'
      },
      {
        key: 'freeweights',
        prefixText: 'free weights',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'freeweightsbenches',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'benches'
          },
          {
            key: 'freeweightssquatracks',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'squat racks'
          }
        ]
      },
      {
        key: 'stretch',
        prefixText: 'stretching space',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'stretchmats',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'mats'
          },
          {
            key: 'stretchrollers',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'rollers'
          }
        ]
      },
    ]
  },
  queries: {
    treadmills: 'Do you see treadmills available at {{locationname}}?',
    ellipticals: 'Do you see ellipticals available at {{locationname}}?',
    freeweights: 'Do you see free weights (dumbbells or barbells) available at {{locationname}}?',
    freeweightsbenches: 'Do you see benches to use with free weights at {{locationname}}?',
    freeweightssquatracks: 'Do you see squat racks to use with free weights at {{locationname}}?',
    stretch: 'Do you see space to stretch at {{locationname}}?',
    stretchmats: 'Do you see any mats to use for stretching at {{locationname}}?',
    stretchrollers: 'Do you see any rollers to use for stretching at {{locationname}}?'
  },
  queryAnswers: {
    treadmills: ['yes', 'no'],
    ellipticals: ['yes', 'no'],
    freeweights: ['yes', 'no'],
    freeweightsbenches: ['yes', 'no'],
    freeweightssquatracks: ['yes', 'no'],
    stretch: ['yes', 'no'],
    stretchmats: ['yes', 'no'],
    stretchrollers: ['yes', 'no']
  },
};

const workspaces = {
  locationType: 'workspace',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    privateseating: '',
    privateseatingoutlets: '',
    sharedseating: '',
    sharedseatingoutlets: '',
    whiteboards: '',
    whiteboardsmarkers: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is',
    suffixText: ', available at {{locationname}}.',
    joinText: ', and also ',
    components: [
      {
        key: 'privateseating',
        prefixText: 'private seating ({{privateseating}})',
        suffixText: '',
        joinText: '',
        components: [
          {
            key: 'privateseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          }
        ]
      },
      {
        key: 'sharedseating',
        prefixText: 'shared seating (communal tables)',
        suffixText: '',
        joinText: '',
        components: [
          {
            key: 'sharedseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          }
        ]
      },
      {
        key: 'whiteboards',
        prefixText: 'whiteboards',
        suffixText: '',
        joinText: '',
        components: [
          {
            key: 'whiteboardsmarkers',
            prefixText: '',
            suffixText: '',
            joinText: '',
            components: 'markers to borrow nearby'
          }
        ]
      },
    ]
  },
  queries: {
    privateseating: 'Do you see private seating (individual tables/chairs) available at {{locationname}}?',
    privateseatingoutlets: 'Do you see private seating (individual tables/chairs) near outlets at {{locationname}}?',
    sharedseating: 'Do you see shared seating (communal tables) available at {{locationname}}?',
    sharedseatingoutlets: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
    whiteboards: 'Do you see any whiteboards currently available to use at {{locationname}}? ',
    whiteboardsmarkers: 'Do you see any dry erase markers nearby for use with whiteboards at {{locationname}}? ',
  },
  queryAnswers: {
    privateseating: ['tables', 'couches/chairs', 'tables and couches/chairs', 'no'],
    privateseatingoutlets: ['yes', 'no'],
    sharedseating: ['yes', 'no'],
    sharedseatingoutlets: ['yes', 'no'],
    whiteboards: ['yes', 'no'],
    whiteboardsmarkers: ['yes', 'no']
  },
};

module.exports = {
  coffeeshops: coffeeshops,
  gyms: gyms,
  workspaces: workspaces
};