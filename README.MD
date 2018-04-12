# Vanity URL generator from email
> Vanity urls are a way to segment your users in your web application, usually by organization or community, for the purposes of allowing group 
discovery and personalization.

These generally work utilizing wildcard records allowing organization names to be placed
before the websites fully qualified domain name. These generally follow the format:

{_testing_}.mydomain.com

for example:

* _coke_.koan.co
* _newrelic_.koan.co


Vanitizer is a simple library of tools to support the creation of organization style vanity urls based on email address.
Vaniztizer also has some small support for organization detection for Google App's SSO.  

## Install
vanitizer is available using [npm](https://npmjs.org):
```
npm install --save vanitizer
```

## Usage

```
const {
  isGoogleEmail,
  isDisposableEmail,
  isFreeEmail,
  isWorkEmail,
  getDomains,
} = require('vanitizer');

// Returns domains based on email
const opts = {
 logger, // uses DEBUG lib by defaul
 wordWhitelist, // json object format: ({ "candidate_name": true })
 wordBlacklist, // json object format: ({ "candidate_name2": true })
 domainBlacklist, // json object format: ({ "candidate.com": true })
 domainWhitelist, // json object format: ({ "candidate2.com": true })
}; // can be undefined

getDomains(opts)('asdf@koan.co'); // returns { domains: [ 'koan', 'koan-co' ], status: true, err: null }
getDomains(opts)('asdf@product.koan.co'); // { domains: [ 'koan', 'koan-co' ], status: true, err: null }
getDomains('asdf@koan.co.uk'); // returns { domains: [ 'koan', 'koan-co-uk' ], status: true, err: null }
getDomains('koan.co'); //

// Is a work email address
isWorkEmail('asdf@koan.co'); // returns { status: true, error: null }
isWorkEmail('asdf@gmail.com'); // returns { status: false, error: null }
isWorkEmail('asdf@koan'); // returns { status: false, error: 'invalid_email' }

// Is a free email address
isFreeEmail('asdf@koan.co'); // returns { status: false, error: null }
isFreeEmail('asdf@gmail.com'); // returns { status: true, error: null }

// Is a disposable email address
isDisposableEmail('asdf@koan.co'); // returns { status: false, error: null }
isDisposableEmail('asdf@mailinator.com'); // returns { status: true, error: null }

// Is a ISP provided email address
isIspEmail('asdf@comcast.net'); // returns { status: true, error: null }
isIspEmail('asdf@comcast.com'); // returns { status: false, error: null }

// Is a google email address
isGoogleEmail('asdf@koan.co'); // returns { status: true, error: null }
isGoogleEmail('asdf@gmail.com'); // returns { status: true, error: null }
```

## Credits & Content
* https://github.com/FGRibreau/mailchecker
* https://github.com/andreis/disposable-email-domains
* https://gist.github.com/gitaarik/5974153
* https://gist.github.com/michenriksen/8710649
* https://github.com/ivolo/disposable-email-domains
* https://github.com/wesbos/burner-email-providers
* https://gist.github.com/tbrianjones/5992856

