'use strict';

const assert = require('assert');

const contributor = require('..');

describe('test', () => {
  it('should be ok', (done) => {
    contributor.getAuthor().then(list => {
      const res = contributor.genMarkDown(list);
      assert.equal(/auto updated/.test(res.content), true);
      done();
    });
  });
});
