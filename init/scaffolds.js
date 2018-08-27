const coffeeshops = {
  locationType: 'coffeeshop',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    privateseating: '',
    privateseatingoutlets: '',
    privateseatingwindows: '',
    sharedseating: '',
    sharedseatingoutlets: '',
    sharedseatingwindows: '',
    stillcorrect: '',
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is',
    suffixText: ', available at {{locationname}}.',
    joinText: ', and also ',
    components: [
      {
        key: 'privateseating',
        prefixText: 'private seating (individual tables)',
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
      },
      {
        key: 'stillcorrect',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: ''
      }
    ]
  },
  queryStructure: [
    {
      key: 'privateseating',
      prompt: 'Do you see private seating (individual tables) available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'privateseatingoutlets',
          prompt: 'Do you see private seating (individual tables) near outlets at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'privateseatingwindows',
          prompt: 'Do you see private seating (individual tables) near the windows at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'sharedseating',
      prompt: 'Do you see shared seating (communal tables) available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'sharedseatingoutlets',
          prompt: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'sharedseatingwindows',
          prompt: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'stillcorrect',
      prompt: 'Is this information still correct?',
      answers: {
        'default': ['yes', 'no']
      },
      children: []
    }
  ],
  loopbackQuestion: 'stillcorrect',
  queries: {
    privateseating: 'Do you see private seating (individual tables) available at {{locationname}}?',
    privateseatingoutlets: 'Do you see private seating (individual tables) near outlets at {{locationname}}?',
    privateseatingwindows: 'Do you see private seating (individual tables) near the windows at {{locationname}}?',
    sharedseating: 'Do you see shared seating (communal tables) available at {{locationname}}?',
    sharedseatingoutlets: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
    sharedseatingwindows: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
    stillcorrect: 'Is this information still correct?'
  },
  queryAnswers: {
    privateseating: ['yes', 'no'],
    privateseatingoutlets: ['yes', 'no'],
    privateseatingwindows: ['yes', 'no'],
    sharedseating: ['yes', 'no'],
    sharedseatingoutlets: ['yes', 'no'],
    sharedseatingwindows: ['yes', 'no'],
    stillcorrect: ['yes', 'no']
  }
};

const gyms = {
  locationType: 'gym',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    treadmills: '',
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
      {
        key: 'stillcorrect',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: ''
      }
    ]
  },
  queryStructure: [
    {
      key: 'treadmills',
      prompt: 'Do you see treadmills available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: []
    },
    {
      key: 'freeweights',
      prompt: 'Do you see free weights (dumbbells or barbells) available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'freeweightsbenches',
          prompt: 'Do you see benches to use with free weights at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'freeweightssquatracks',
          prompt: 'Do you see squat racks to use with free weights at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'stretch',
      prompt: 'Do you see space to stretch at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'stretchmats',
          prompt: 'Do you see any mats to use for stretching at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'stretchrollers',
          prompt: 'Do you see any rollers to use for stretching at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'stillcorrect',
      prompt: 'Is this information still correct?',
      answers: {
        'default': ['yes', 'no']
      },
      children: []
    }
  ],
  loopbackQuestion: 'stillcorrect',
  queries: {
    treadmills: 'Do you see treadmills available at {{locationname}}?',
    freeweights: 'Do you see free weights (dumbbells or barbells) available at {{locationname}}?',
    freeweightsbenches: 'Do you see benches to use with free weights at {{locationname}}?',
    freeweightssquatracks: 'Do you see squat racks to use with free weights at {{locationname}}?',
    stretch: 'Do you see space to stretch at {{locationname}}?',
    stretchmats: 'Do you see any mats to use for stretching at {{locationname}}?',
    stretchrollers: 'Do you see any rollers to use for stretching at {{locationname}}?',
    stillcorrect: 'Is this information still correct?'
  },
  queryAnswers: {
    treadmills: ['yes', 'no'],
    freeweights: ['yes', 'no'],
    freeweightsbenches: ['yes', 'no'],
    freeweightssquatracks: ['yes', 'no'],
    stretch: ['yes', 'no'],
    stretchmats: ['yes', 'no'],
    stretchrollers: ['yes', 'no'],
    stillcorrect: ['yes', 'no']
  },
};

const workspaces = {
  locationType: 'workspace',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    privateseating: '',
    privateseatingoutlets: '',
    privateseatingwindows: '',
    sharedseating: '',
    sharedseatingoutlets: '',
    sharedseatingwindows: '',
    stillcorrect: '',
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is',
    suffixText: ', available at {{locationname}}.',
    joinText: ', and also ',
    components: [
      {
        key: 'privateseating',
        prefixText: 'private seating (individual tables)',
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
      },
      {
        key: 'stillcorrect',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: ''
      }
    ]
  },
  queryStructure: [
    {
      key: 'privateseating',
      prompt: 'Do you see private seating (individual tables) available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'privateseatingoutlets',
          prompt: 'Do you see private seating (individual tables) near outlets at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'privateseatingwindows',
          prompt: 'Do you see private seating (individual tables) near the windows at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'sharedseating',
      prompt: 'Do you see shared seating (communal tables) available at {{locationname}}?',
      answers: {
        'default': ['yes', 'no']
      },
      children: [
        {
          key: 'sharedseatingoutlets',
          prompt: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        },
        {
          key: 'sharedseatingwindows',
          prompt: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
          answers: {
            'default': ['yes', 'no']
          },
          children: []
        }
      ]
    },
    {
      key: 'stillcorrect',
      prompt: 'Is this information still correct?',
      answers: {
        'default': ['yes', 'no']
      },
      children: []
    }
  ],
  loopbackQuestion: 'stillcorrect',
  queries: {
    privateseating: 'Do you see private seating (individual tables) available at {{locationname}}?',
    privateseatingoutlets: 'Do you see private seating (individual tables) near outlets at {{locationname}}?',
    privateseatingwindows: 'Do you see private seating (individual tables) near the windows at {{locationname}}?',
    sharedseating: 'Do you see shared seating (communal tables) available at {{locationname}}?',
    sharedseatingoutlets: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
    sharedseatingwindows: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
    stillcorrect: 'Is this information still correct?'
  },
  queryAnswers: {
    privateseating: ['yes', 'no'],
    privateseatingoutlets: ['yes', 'no'],
    privateseatingwindows: ['yes', 'no'],
    sharedseating: ['yes', 'no'],
    sharedseatingoutlets: ['yes', 'no'],
    sharedseatingwindows: ['yes', 'no'],
    stillcorrect: ['yes', 'no']
  }
};

const freefood = {
  locationType: 'freefood',
  refreshTime: 4 * 60 * 60, // 4 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    foodevent: '',
    kindfood: '',
    specificfood: '',
    typefood: '',
    stillleft: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is ',
    suffixText: ' available at {{locationname}}.',
    joinText: '',
    components: [
      {
        key: 'kindfood',
        prefixText: 'free',
        suffixText: '',
        joinText: ' ',
        components: [
          {
            key: 'typefood',
            prefixText: '',
            suffixText: '',
            joinText: '',
            components: ''
          },
          {
            key: 'specificfood',
            prefixText: '',
            suffixText: '',
            joinText: '',
            components: ''
          }
        ]
      },
      {
        key: 'stillleft',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: ''
      }
    ]
  },
  queryStructure: [
    {
      key: 'kindfood',
      prompt: 'What kind of food is the free food in {{locationname}}?',
      answers: {
        'default': ['savory', 'sweet']
      },
      children: [
        {
          key: 'specificfood',
          prompt: 'What specific food is the {{kindfood}} in {{locationname}}?',
          answers: {
            'savory': ['pizza', 'bags of nuts/chips'],
            'sweet': ['ice cream', 'popsicles', 'candy'],
            'default': []
          },
          children: [
            {
              key: 'typefood',
              prompt: 'What type of food is the {{specificfood}}in {{locationname}}?',
              answers: {
                'pizza': ['cheese', 'pepperoni'],
                'bags of nuts/chips': ['almonds', 'potato chips', 'pretzels'],
                'ice cream': ['chocolate', 'vanilla'],
                'popsicles': ['cherry', 'grape', 'orange'],
                'candy': ['chocolate bar', 'fruit snacks'],
                'default': []
              },
              children: []
            }
          ]
        }
      ]
    },
    {
      key: 'stillleft',
      prompt: 'Is there still free food left at {{locationname}}?',
      answers: {
        default: ['yes', 'no']
      },
      children: []
    }
  ],
  loopbackQuestion: 'stillleft',
  queries: {
    foodevent: 'Do you see free food in {{locationname}}?',
    kindfood: 'What kind of food is the free food in {{locationname}}?',
    specificfood: 'What specific food is the {{kindfood}} in {{locationname}}?',
    typefood: 'What type of food is the {{specificfood}}in {{locationname}}?',
    stillleft: 'Is there still free food left at {{locationname}}?'
  },
  queryAnswers: {
    foodevent: ['yes', 'no'],
    kindfood: ['savory', 'sweet'],
    specificfood: ['pizza', '﻿bagged nuts/chips', 'ice cream', 'popsicles', 'candy'],
    typefood: ['cheese', 'pepperoni', 'almonds', 'popcorn', 'potato chips', 'pretzels',
      'chocolate', 'vanilla', 'cherry', 'grape', 'orange', 'chocolate bar',
      'fruit snack'],
    stillleft: ['yes', 'no']
  },
};

module.exports = {
  coffeeshops: coffeeshops,
  gyms: gyms,
  workspaces: workspaces,
  freefood: freefood
};