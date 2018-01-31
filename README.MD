# Vanity Url Generator from email
> Vanity urls are a way to segment your users, usually by organization or community, for the purposes of allowing group 
discovery and personalization in your web application 

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

Include the features you'd like to use:

```
const {
  isGoogleAppsDomain,
  isDisposable,
  isFreeMail,
  isGoogleEmail,
  isWorkEmail,
  getDomains
}

// Returns domains based on email
const opts = {
 logger, // uses DEBUG lib by defaul
 whitelist, // json object format: ({ "candidate_name": true })
 blacklist, // json object format: ({ "candidate_name2": true })
}; // can be undefined

getDomains(opts)('matt@koan.co'); // returns { domains: [ 'koan', 'koan-co' ], valid: true, err: null }
getDomains(opts)('matt@product.koan.co'); // { domains: [ 'koan', 'koan-co' ], valid: true, err: null }
getDomains('matt@koan.co.uk'); // returns { domains: [ 'koan', 'koan-co-uk' ], valid: true, err: null }
getDomains('koan.co'); //

// Is work email
isWorkEmail('asdf@koan.co'); // returns { status: true, error: null }
isWorkEmail('asdf@gmai.com'); // returns { status: false, error: null }
isWorkEmail('asdf@koan'); // returns { status: false, error: 'invalid_email' }

```

## Credits & Content
* https://github.com/FGRibreau/mailchecker
* https://github.com/andreis/disposable-email-domains
* https://gist.github.com/gitaarik/5974153
* https://gist.github.com/michenriksen/8710649
* https://github.com/ivolo/disposable-email-domains
* https://github.com/wesbos/burner-email-providers
* https://gist.github.com/tbrianjones/5992856

