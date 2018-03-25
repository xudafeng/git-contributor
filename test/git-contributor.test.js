'use strict';

const assert = require('assert');

const contributor = require('..');

describe('test', () => {
  it('should be ok', (done) => {
    contributor.getAuthor().then(d => {
      done();
    });
  });
});
