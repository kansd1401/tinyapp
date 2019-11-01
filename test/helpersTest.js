const { assert } = require('chai');

const { getUserByEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const urlDatabase = {
  qc3hdc: { longURL: 'google.com', userId: '1b12b2' },
  '333vbb': { longURL: 'google.com', userId: '87yvz6' },
  nocxjt: {
    longURL: 'https://www.techonthenet.com/js/string_length.php',
    userId: '87yvz6'
  },
  ezz9mn: { longURL: 'https://www.chaijs.com/api/assert/', userId: '87yvz6' }
};

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('urlsForUser', function() {
  it('should return a array of urls', function() {
    const user = urlsForUser('1b12b2', urlDatabase);
    const expectedOutput = 'qc3hdc';
    assert.equal(Object.keys(user)[0],expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });
  it('should return undefined', function() {
    const user = getUserByEmail("adsdasdasd@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return undefined', function() {
    const output = generateRandomString();
    const expectedOutput = 6;
    assert.equal(output.length,expectedOutput);
  });
});


