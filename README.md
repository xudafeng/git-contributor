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

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars1.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars3.githubusercontent.com/u/1209810?v=4" width="100px;"/><br/><sub><b>paradite</b></sub>](https://github.com/paradite)<br/>|
| :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Fri Jan 25 2019 22:17:59 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

## Spec

- The listings show all the contributors.
- Sort by contributions number.

If there is no `repository` field, fall back to the rule:

- Auto generate from git info.
- Sort by commit date.

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

### Searching Sample

`encodeURIComponent('xudafeng@126.com')` will be convert to `xudafeng%40126.com`, please replace to test it.

```
https://api.github.com/search/users?q=xudafeng%40126.com%20in%3Aemail%20type%3Auser
```

## License

The MIT License (MIT)
