export const original = {
  'protocol' : 'https://tbd.website/protocols/tbdex',
  'types'    : {
    'RFQ': {
      'schema'      : 'https://tbd.website/protocols/tbdex/RequestForQuote',
      'dataFormats' : [
        'application/json'
      ]
    },
    'Quote': {
      'schema'      : 'https://tbd.website/protocols/tbdex/Quote',
      'dataFormats' : [
        'application/json'
      ]
    }
  },
  'structure': {
    'RFQ': {
      '$actions': [
        {
          'who' : 'anyone',
          'can' : 'write'
        }
      ],
      'Quote': {
        '$actions': [
          {
            'who' : 'recipient',
            'of'  : 'RFQ',
            'can' : 'write'
          }
        ]
      }
    }
  }
};

/**
 * - 'roles' is new
 * - 'to' is new
 * - 'anyone' and 'self' keywords
 */
export const protocolDefinition = {
  'protocol' : 'https://tbd.website/protocols/tbdex',
  'types'    : {
    'AssumePFIRole': {
      'schema'      : 'https://tbd.website/protocols/tbdex/AssumePFI',
      'dataFormats' : [
        'application/json'
      ]
    },
    'RFQ': {
      'schema'      : 'https://tbd.website/protocols/tbdex/RequestForQuote',
      'dataFormats' : [
        'application/json'
      ]
    },
    'Quote': {
      'schema'      : 'https://tbd.website/protocols/tbdex/Quote',
      'dataFormats' : [
        'application/json'
      ]
    }
  },
  'roles': [ // assumption or delegation of roles
    'PFI', 'User'
  ],
  'structure': {
    'AssumePFIRole': {
      '$actions': [
        {
          'who' : 'anyone',
          'can' : 'write',
          'to'  : 'self'
        },
        {
          'who' : 'anyone',
          'can' : 'query'
        }
      ],
    },
    'RFQ': {
      '$actions': [
        {
          'who' : 'User',
          'can' : 'write',
          'to'  : 'PFI'
        }
      ],
      'Quote': {
        '$actions': [
          {
            'who' : 'PFI',
            'can' : 'write',
            'to'  : 'User'
          }
        ]
      }
    }
  }
};