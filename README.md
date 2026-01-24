# git-contributor

[![NPM version][npm-image]][npm-url]
[![build status][CI-image]][CI-url]
[![Test coverage][codecov-image]][codecov-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/git-contributor.svg
[npm-url]: https://npmjs.org/package/git-contributor
[CI-image]: https://github.com/xudafeng/git-contributor/actions/workflows/ci.yml/badge.svg
[CI-url]: https://github.com/xudafeng/git-contributor/actions/workflows/ci.yml
[codecov-image]: https://img.shields.io/codecov/c/github/xudafeng/git-contributor.svg?logo=codecov
[codecov-url]: https://app.codecov.io/gh/xudafeng/git-contributor
[node-image]: https://img.shields.io/badge/node.js-%3E=_8-green.svg
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/git-contributor.svg
[download-url]: https://npmjs.org/package/git-contributor

> Welcome to join in and feel free to contribute.

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/octocat?v=4" width="80px;"/><br/><sub><b>octocat</b></sub>](https://github.com/octocat)<br/>|[<img src="https://avatars.githubusercontent.com/u/1011681?v=4" width="80px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars.githubusercontent.com/u/11213298?v=4" width="80px;"/><br/><sub><b>WynterDing</b></sub>](https://github.com/WynterDing)<br/>|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="80px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/1209810?v=4" width="80px;"/><br/><sub><b>paradite</b></sub>](https://github.com/paradite)<br/>|[<img src="https://avatars.githubusercontent.com/u/52845048?v=4" width="80px;"/><br/><sub><b>snapre</b></sub>](https://github.com/snapre)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Sat Jan 24 2026 11:54:46 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

## Who are using

- ⭐⭐⭐[antvis/g2](//github.com/antvis/g2)
- ⭐⭐⭐[cnpm/npminstall](//github.com/cnpm/npminstall)
- ⭐⭐⭐[alibaba/f2etest](//github.com/alibaba/f2etest)
- ⭐⭐⭐[alibaba/uirecorder](//github.com/alibaba/uirecorder)
- ⭐⭐⭐[hiloteam/Hilo](//github.com/hiloteam/Hilo)
- ⭐⭐⭐[node-modules/detect-port](//github.com/node-modules/detect-port)
- ⭐⭐⭐[node-modules/utility](//github.com/node-modules/utility)
- ⭐⭐⭐[node-modules/urllib](//github.com/node-modules/urllib)
- ⭐⭐⭐[macacajs/macaca-datahub](//github.com/macacajs/macaca-datahub)

[For more](//github.com/xudafeng/git-contributor/network/dependents)

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
# add fixed owners
$ git-contributor --owners OWNERS.md
```

### Searching Sample

`encodeURIComponent('xudafeng@126.com')` will be convert to `xudafeng%40126.com`, please replace to test it.

```
https://api.github.com/search/users?q=xudafeng%40126.com%20in%3Aemail%20type%3Auser
```

## License

The MIT License (MIT)
