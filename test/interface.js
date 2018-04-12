const { assert } = require('chai');
const {
  isGoogleAppsDomain,
  isGoogleEmail,
  isDisposableEmail,
  isFreeEmail,
  isWorkEmail,
  isIspEmail,
  getDomains,
  getSubLevelDomain,
} = require('../');

describe('interface test', () => {
  it('getDomains', () => {
    assert.deepEqual(getDomains()('asdf@koan.co').domains, ['koan', 'koan-co']);
    assert.deepEqual(getDomains()('asdf@us.koan.co').domains, ['koan', 'koan-co']);
    assert.deepEqual(getDomains()('asdf@koan.co.uk').domains, ['koan', 'koan-co', 'koan-co-uk']);
    assert.equal(getDomains()('koan.co').status, false);
    assert.equal(getDomains()('koan').status, false);
    assert.equal(getDomains({ domainWhitelist: { 'gmail.com': true } })('asdf@gmail.com').status, true);
    assert.equal(getDomains({ domainBlacklist: { 'koan.co': true } })('asdf@koan.co').status, false);
    assert.equal(getDomains({ wordWhitelist: { shit: true } })('asdf@shit.com').status, true);
    assert.equal(getDomains({ wordBlacklist: { koan: true } })('asdf@koan.co').status, false);
  });
  it('getSubLevelDomain', () => {
    assert.equal(getSubLevelDomain('asdf@usa.ibm.com'), 'ibm.com');
  });
  it('isWorkEmail', () => {
    assert.equal(isWorkEmail('asdf@koan.co').status, true);
    assert.equal(isWorkEmail('asdf@gmail.com').status, false);
  });
  it('isIspEmail', () => {
    assert.equal(isIspEmail('asdf@comcast.net').status, true);
    assert.equal(isIspEmail('asdf@comcast.com').status, false);
    assert.equal(isWorkEmail('asdf@asdf').status, false);
  });
  it('isGoogleAppsDomain', async () => {
    assert.equal((await isGoogleAppsDomain('koan.co')).status, true);
    assert.equal((await isGoogleAppsDomain('koan.com')).status, false);
  });
  it('isGoogleEmail', async () => {
    assert.equal(await isGoogleEmail('asdf@koan.co'), true);
  });
  it('isGoogleEmail times out', () =>
    isGoogleEmail('asdf@koan.co', { timeout: 1 })
      .then(() => { throw new Error('Expected .isGoogleEmail to throw!'); })
      .catch(() => null));

  it('isDisposableEmail', async () => {
    assert.equal(await isDisposableEmail('asdf@mailinator.com').status, true);
    assert.equal(await isDisposableEmail('asdf@koan.co').status, false);
  });
  it('isFreeEmail', async () => {
    assert.equal(await isFreeEmail('asdf@gmail.com').status, true);
    assert.equal(await isFreeEmail('asdf@koan.co').status, false);
  });
});
