# git-contributor

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/git-contributor.svg?style=flat-square
[npm-url]: https://npmjs.org/package/git-contributor
[travis-image]: https://img.shields.io/travis/xudafeng/git-contributor.svg?style=flat-square
[travis-url]: https://travis-ci.org/xudafeng/git-contributor
[coveralls-image]: https://img.shields.io/coveralls/xudafeng/git-contributor.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/xudafeng/git-contributor?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/git-contributor.svg?style=flat-square
[download-url]: https://npmjs.org/package/git-contributor

> Welcome to join in and feel free to contribute.

## Spec

- The listings show recently contributors.
- Sort by commit date.
- Auto generate from git info.

## Installment

```bash
$ npm i git-contributor --save-dev
```

```json
"devDependencies": {
  ...
  "git-contributor": "*",
  ...
},
"scripts": {
  ...
  "contributor": "git-contributor",
  ...
}
```

```bash
$ npm run contributor
# github API service limit
$ OAUTH_TOKEN=****** npm run contributor
```

## License

The MIT License (MIT)
