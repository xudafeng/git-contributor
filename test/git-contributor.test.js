'use strict';

const assert = require('assert');

const contributor = require('..');

describe('test', () => {
  it('should be ok', async () => {
    const list = await contributor.getAuthor();
    const res = contributor.genMarkDown(list);
    assert.equal(/auto updated/.test(res.content), true);
  });

  it('should handle more than 12 authors', async () => {
    const list = await contributor.getAuthor({
      cwd: '/',
      url: 'git://github.com/macacajs/macacajs.github.io.git'
    });
    const res = contributor.genMarkDown(list);
    assert.equal(res.content.split('|\n').length >= 4, true);
  });
});
