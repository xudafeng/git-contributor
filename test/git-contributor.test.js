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

  it('should handle more than 12 authors', (done) => {
    contributor.getAuthor({
      cwd: '/',
      url: 'git://github.com/macacajs/macacajs.github.io.git'
    }).then(list => {
      const res = contributor.genMarkDown(list);
      assert.equal(res.content.split('|\n').length >= 4, true);
      done();
    });
  });
});
