'use strict';

const _ = require('xutil');
const {
  execSync
} = require('child_process');
const {
  parse
} = require('url');
const path = require('path');
const Promise = require('bluebird');
const request = require('request-promise');

const pkg = require('../package');

const gitLog2MailList = () => {
  const logs = execSync('git log --pretty="%an <%ae>"').toString();
  const list = logs.split(/\n/g).reverse();
  return _.uniq(list)
    .filter(item => item.length)
    .map(item => {
      return item.split(/\s+/g).pop();
    });
};

const getInfoFromGithub = maillist => {
  const api = 'https://api.github.com/search/users?q=';
  const tasks = maillist.map(email => {
    const options = {
      uri: `${api}${encodeURIComponent(email + ' in:email type:user')}`,
      json: true,
      headers: {
        'user-agent': Date.now()
      }
    };
    if (process.env.OAUTH_TOKEN) {
      options.headers['Authorization'] = `token ${process.env.OAUTH_TOKEN}`;
    }
    return request(options);
  });

  return Promise.all(tasks).then(list => {
    return list.map(item => {
      if (item && item.total_count === 1) {
        return item.items[0];
      }
    });
  });
};

const getInfoFromGithubNewAPI = info => {
  const uri = `https://api.github.com/repos/${info.groupName}/${info.repoName}/contributors`;
  const options = {
    uri,
    json: true,
    headers: {
      'user-agent': Date.now()
    }
  };
  if (process.env.OAUTH_TOKEN) {
    options.headers['Authorization'] = `token ${process.env.OAUTH_TOKEN}`;
  }
  return request(options);
};

const format = list => {
  return list.filter(item => item).map(item => {
    return {
      login: item.login,
      avatar_url: item.avatar_url,
      html_url: item.html_url
    };
  });
};

const getRepoInfo = async (url) => {
  // git@github.com:xudafeng/git-contributor.git
  // https://github.com/xudafeng/git-contributor
  if (url.slice(0, 4) === 'git@') {
    url = url
      .replace(':', '/')
      .replace('git@', 'http://');
  }
  url = url
    .replace(/\.git/g, '');
  const obj = parse(url);
  const arr = obj.pathname.split('/');
  return {
    groupName: arr[1],
    repoName: arr[2],
  };
};

exports.getAuthor = async (options = {}) => {
  const cwd = path.resolve(options.cwd || process.cwd());
  const originPkg = path.join(cwd, 'package.json');
  const dotGitDir = path.join(cwd, '.git');

  if (_.isExistedFile(originPkg)) {
    try {
      const pkg = require(originPkg);
      if (pkg.repository && pkg.repository.url) {
        const info = await getRepoInfo(pkg.repository.url);
        const infoList = await getInfoFromGithubNewAPI(info);
        return format(infoList);
      }
    } catch (e) {
    }
  }

  if (!_.isExistedDir(dotGitDir)) {
    return [];
  }
  const mailList = gitLog2MailList();
  const infoList = await getInfoFromGithub(_.uniq(mailList));
  return format(infoList);
};

exports.genMarkDown = list => {
  const startToken = '<!-- GITCONTRIBUTOR_START -->';
  const endToken = '<!-- GITCONTRIBUTOR_END -->';
  const content1 = [''];
  const lineMax = 6;
  const content1Data = list.splice(0, lineMax);
  content1Data.map((item, key) => {
    content1.push(`[<img src="${item.avatar_url}" width="100px;"/><br/><sub><b>${item.login}</b></sub>](${item.html_url})<br/>`);
  });
  const content2 = [''];
  list.map((item, key) => {
    content2.push(`[<img src="${item.avatar_url}" width="100px;"/><br/><sub><b>${item.login}</b></sub>](${item.html_url})<br/>`);
  });
  const genLine = (number) => {
    const r = [];
    while (number--) {
      r.push(' :---: ');
    }
    return r;
  };

  const res = [
    startToken,
    '',
    '## Contributors',
    '',
    content1.join('|'),
    `|${genLine(content1Data.length).join('|')}|`,
    content2.join('|'),
    '',
    `This project follows the git-contributor [spec](${pkg.homepage}), auto upated at \`${_.moment()}\`.`,
    '',
    endToken
  ];

  return {
    content: res.join('\n'),
    startToken,
    endToken
  };
};
