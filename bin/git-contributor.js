#!/usr/bin/env node

'use strict';

const fs = require('fs');
const _ = require('xutil');
const path = require('path');
const program = require('commander');

const gen = require('../lib/git-contributor');

program
  .option('-m, --markdown', 'auto parse and update README.md')
  .option('-p, --print', 'render markdown file')
  .option('-u, --url <s>', 'point the github repo\'s url')
  .option('-v, --versions', 'output version infomation')
  .parse(process.argv);

const options = Object.assign({
  markdown: true,
  print: true
}, program);

gen.getAuthor(options)
  .then(list => {
    const res = gen.genMarkDown(list);
    if (options.markdown) {
      const readmes = [ 'README.md', 'readme.md', 'README.zh-CN.md' ];
      readmes.forEach(readmeName => {
        const readmeFile = path.join(process.cwd(), readmeName);
        if (_.isExistedFile(readmeFile)) {
          let readmeContent = fs.readFileSync(readmeFile, 'utf8');
          const reg = new RegExp(`${res.startToken}[^]*${res.endToken}`);
          if (reg.test(readmeContent)) {
            readmeContent = readmeContent.replace(reg, res.content);
          } else {
            readmeContent += res.content;
          }
          fs.writeFileSync(readmeFile, readmeContent);
        }
      });
    }
    if (options.print) {
      console.log(res.content);
    }
  })
  .catch(e => {
    console.log(e);
  });
