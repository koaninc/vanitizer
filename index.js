const validator = require('validator');
const { parse } = require('tldjs');
const request = require('request-promise');
const Promise = require('bluebird');
const dns = require('dns');
const debug = require('debug');

const resolve = Promise.promisify(dns.resolve);

const DISPOSABLE_EMAILS = require('./lib/disposable.json');
const FREE_EMAILS = require('./lib/free.json');
const BAD_WORDS = require('./lib/badwords.json');

const GMAIL_MX_STRING = 'aspmx.l.google.com';

const extractDomain = (email) => {
  if (!validator.isEmail(email)) {
    // left over from joi
    throw new Error('invalid email');
  }
  return email.split('@')[1].trim();
};

const generateCandidates = domain => (domain
  .split('.')
  .reduce((acc, val, idx, array) => {
    acc.push(array.slice(0, array.length - idx).join('-'));
    return acc;
  }, [])
  .reverse());

const checkCandidate = (whitelist, blacklist) => (candidate) => {
  if (blacklist[candidate]) {
    return {
      domain: candidate,
      status: false,
      description: 'blacklist',
    };
  }
  if (whitelist[candidate]) {
    return {
      domain: candidate,
      status: true,
      description: 'whitelist',
    };
  }
  if (BAD_WORDS[candidate]) {
    return {
      domain: candidate,
      status: false,
      description: 'bad_word',
    };
  }
  return {
    domain: candidate,
    status: true,
    description: null,
  };
};

const checkEmailDomain = (whitelist, blacklist) => (domain) => {
  if (blacklist[domain]) {
    return {
      domain: null,
      status: false,
      description: 'blacklist',
    };
  }
  if (whitelist[domain]) {
    return {
      domain,
      status: true,
      description: 'whitelist',
    };
  }
  if (DISPOSABLE_EMAILS[domain]) {
    return {
      domain: null,
      status: false,
      description: 'disposable',
    };
  }
  if (FREE_EMAILS[domain]) {
    return {
      domain: null,
      status: false,
      description: 'free',
    };
  }
  return {
    domain,
    status: true,
    description: null,
  };
};

/*
 * Use this at your own peril
 */
const isGoogleAppsDomain = domain => (request({
  uri: `https://www.google.com/a/${domain}/acs`,
  resolveWithFullResponse: true,
}).then((res) => {
  if (res.statusCode && res.statusCode === 200 && !res.body) {
    return {
      status: true,
      err: null,
    };
  }
  return {
    status: false,
    err: null,
  };
}).catch(err => ({
  status: false,
  err,
})));

const isGoogleEmail = (email) => {
  const domain = extractDomain(email);
  return resolve(domain, 'MX')
    .then(records => records.some((record) => {
      if (!record.exchange) {
        return false;
      }
      return record.exchange.toLowerCase().includes(GMAIL_MX_STRING);
    }));
};

const isDisposableEmail = (email) => {
  let domain;
  try {
    domain = extractDomain(email);
  } catch (err) {
    return {
      status: false,
      error: 'invalid_email',
    };
  }
  const status = Boolean(DISPOSABLE_EMAILS[domain]);

  return {
    status,
    error: null,
  };
};

const isFreeEmail = (email) => {
  let domain;
  try {
    domain = extractDomain(email);
  } catch (err) {
    return {
      status: false,
      error: 'invalid_email',
    };
  }
  const status = Boolean(FREE_EMAILS[domain]);

  return {
    status,
    error: null,
  };
};

const isWorkEmail = (email) => {
  let domain;
  try {
    domain = extractDomain(email);
  } catch (err) {
    return {
      status: false,
      error: 'invalid_email',
    };
  }
  const status = Boolean(!FREE_EMAILS[domain] && !DISPOSABLE_EMAILS[domain]);
  return {
    status,
    error: null,
  };
};

const getDomains = (opts = {}) => (email) => {
  const wordWhitelist = opts.wordWhitelist || {};
  const wordBlacklist = opts.wordBlacklist || {};
  const domainWhitelist = opts.domainWhitelist || {};
  const domainBlacklist = opts.domainBlacklist || {};
  const logger = opts.logger || debug;
  let domain;
  let publicSuffix;
  try {
    const emailFQDN = extractDomain(email);
    const emailCheck = checkEmailDomain(domainWhitelist, domainBlacklist)(emailFQDN);
    if (!emailCheck.status) {
      return {
        domains: null,
        status: emailCheck.status,
        err: emailCheck.description,
      };
    }
    const {
      isValid,
      domain: dom,
      publicSuffix: pub,
    } = parse(emailFQDN);
    if (!isValid) {
      return {
        domains: null,
        status: false,
        err: 'invalid_tld',
      };
    }
    domain = dom;
    publicSuffix = pub;
    if (!domain || !publicSuffix) {
      return {
        domains: null,
        status: false,
        err: 'no_domain_or_publicSuffix',
      };
    }
  } catch (err) {
    return {
      domains: null,
      status: false,
      err: 'invalid_email',
    };
  }
  const baseCandidate = domain.split('.')[0];
  if (!wordWhitelist[baseCandidate] && BAD_WORDS[baseCandidate]) {
    return {
      domains: null,
      status: false,
      description: 'bad_word',
    };
  }
  if (wordBlacklist[baseCandidate]) {
    return {
      domains: null,
      status: false,
      description: 'blacklist',
    };
  }
  const candidates = generateCandidates(domain);
  const candidateStatuses = candidates.map(checkCandidate(wordWhitelist, wordBlacklist));
  candidateStatuses.forEach((candidate) => {
    logger('vanitizer:', `${candidate.domain} rejected due to: ${candidate.description}`);
  });
  return {
    domains: candidateStatuses
      .filter(candidate => candidate.status)
      .map(candidate => candidate.domain),
    status: true,
    err: null,
  };
};

const getSubLevelDomain = (email) => {
  const fqdn = extractDomain(email);
  const { domain } = parse(fqdn);
  return domain;
};

module.exports = {
  isGoogleAppsDomain,
  isGoogleEmail,
  isDisposableEmail,
  isFreeEmail,
  isWorkEmail,
  getDomains,
  getSubLevelDomain,
  getDomainCandidates: getDomains,
};
