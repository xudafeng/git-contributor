#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');

const gen = require('../lib/git-contributor');

program
  .option('-m, --markdown', 'auto parse and update README.md')
  .option('-p, --print', 'render markdown file')
  .option('-u, --url <s>', 'point the github repo\'s url')
  .option('-o, --owners <s>', 'read fixed contributor list from file')
  .option('-s, --size <size>', 'avatar size: large(100px), medium(80px), small(60px)', 'medium')
  .option('-v, --versions', 'output version infomation')
  .parse(process.argv);

const options = Object.assign({
  markdown: true,
  print: true
}, program);

const cwd = process.cwd();

gen.getAuthor(options)
  .then(list => {
    if (options.markdown) {
      fs.readdirSync(cwd)
        .filter(item => {
          return path.extname(item) === '.md' && item.toLowerCase().includes('readme');
        })
        .map(item => path.resolve(cwd, item))
        .map(readmeFile => {
          let readmeContent = fs.readFileSync(readmeFile, 'utf8');
          const res = gen.genMarkDown(list.slice(), readmeContent, { size: options.size });
          const reg = new RegExp(`${res.startToken}[^]*${res.endToken}`);

          if (reg.test(readmeContent)) {
            readmeContent = readmeContent.replace(reg, res.content);
          } else {
            readmeContent += res.content;
          }

          fs.writeFileSync(readmeFile, readmeContent);

          if (options.print) {
            console.log(res.content);
          }
        });
    }
  })
  .catch(e => {
    console.log(e);
  });
