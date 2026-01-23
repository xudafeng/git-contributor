'use strict';

const _ = require('xutil');
const {
  execSync
} = require('child_process');
const fs = require('fs');
const {
  parse
} = require('url');
const path = require('path');
const httpclient = require('urllib');

const pkg = require('../package');

const SIZE_MAP = {
  large: 100,
  medium: 80,
  small: 60
};

const gitLog2MailList = () => {
  const logs = execSync('git log --pretty="%an <%ae>"').toString();
  const list = logs.split(/\n/g).reverse();
  return _.uniq(list)
    .filter(item => item.length)
    .map(item => {
      return item.split(/\s+/g).pop();
    });
};

const requestGithub = (uri) => {
  const options = {
    dataType: 'json',
    headers: {
      'user-agent': Date.now()
    },
    timeout: 30000
  };
  if (process.env.OAUTH_TOKEN) {
    options.headers['Authorization'] = `token ${process.env.OAUTH_TOKEN}`;
  }
  return httpclient.request(uri, options).then(res => res.data);
};

const getInfoFromGithub = maillist => {
  const api = 'https://api.github.com/search/users?q=';
  const tasks = maillist.map(email => {
    const uri = `${api}${encodeURIComponent(email + ' in:email type:user')}`;
    return requestGithub(uri);
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
  // https://docs.github.com/en/rest/reference/repos#list-repository-contributors get top 100 contributors
  const uri = `https://api.github.com/repos/${info.groupName}/${info.repoName}/contributors?per_page=100`;
  return requestGithub(uri);
};

const isBotUser = (login) => {
  const botPatterns = [
    'github-actions',
    'dependabot',
    'renovate',
    'greenkeeper',
    'snyk-bot',
    'codecov',
    'coveralls'
  ];
  const lowerLogin = login.toLowerCase();
  return botPatterns.some(pattern => lowerLogin.includes(pattern)) || lowerLogin.endsWith('[bot]');
};

const format = list => {
  return list.filter(item => item && !isBotUser(item.login)).map(item => {
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
    .replace(/\.git$/g, '');
  const obj = parse(url);
  const arr = obj.pathname.split('/');
  return {
    groupName: arr[1],
    repoName: arr[2]
  };
};

const parseOwnersFile = (ownersPath) => {
  if (!ownersPath || !_.isExistedFile(ownersPath)) {
    return [];
  }
  const content = fs.readFileSync(ownersPath, 'utf8');
  return _.uniq(content.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
};

exports.getAuthor = async (options = {}) => {
  const cwd = path.resolve(options.cwd || process.cwd());
  const pointGithubRepoUrl = options.url;
  const originPkg = path.join(cwd, 'package.json');
  const dotGitDir = path.join(cwd, '.git');
  const ownersPath = options.owners ? path.resolve(cwd, options.owners) : null;

  let authorList = [];
  let contributorList = [];

  // First, get contributors from GitHub or git log
  if (_.isExistedFile(originPkg)) {
    try {
      const pkg = require(originPkg);
      if (pkg.repository) {
        let repoUrl;
        // repository can be a string or an object with url property
        if (typeof pkg.repository === 'string') {
          repoUrl = pkg.repository;
        } else if (pkg.repository.url) {
          repoUrl = pkg.repository.url;
        }

        if (repoUrl) {
          const info = await getRepoInfo(repoUrl);
          const infoList = await getInfoFromGithubNewAPI(info);
          contributorList = format(infoList);
        }
      }
    } catch (e) {
    }
  } else if (pointGithubRepoUrl) {
    const info = await getRepoInfo(pointGithubRepoUrl);
    const infoList = await getInfoFromGithubNewAPI(info);
    contributorList = format(infoList);
  }

  if (!contributorList.length) {
    if (!_.isExistedDir(dotGitDir)) {
      contributorList = [];
    } else {
      const mailList = gitLog2MailList();
      const infoList = await getInfoFromGithub(_.uniq(mailList));
      contributorList = format(infoList);
    }
  }

  // Process owners first (they get priority)
  if (ownersPath) {
    const owners = parseOwnersFile(ownersPath);
    if (owners.length) {
      owners.forEach(login => {
        // Skip bot users
        if (!isBotUser(login)) {
          authorList.push({
            login,
            avatar_url: `https://avatars.githubusercontent.com/${login}?v=4`,
            html_url: `https://github.com/${login}`
          });
        }
      });
    }
  }

  // Then append contributors that are not already in the owners list
  const ownersLoginSet = new Set(authorList.map(author => author.login));
  contributorList.forEach(contributor => {
    if (!ownersLoginSet.has(contributor.login)) {
      authorList.push(contributor);
    }
  });

  return authorList;
};

const ifHasZh = (readMeContext) => {
  let count = 0;
  readMeContext.split('').forEach(char => {
    if (/[\u4e00-\u9fa5]/.test(char)) count++;
  });
  return count / readMeContext.length >= 0.1;
};

exports.genMarkDown = (list, readMeContext = '', options = {}) => {
  const startToken = '<!-- GITCONTRIBUTOR_START -->';
  const endToken = '<!-- GITCONTRIBUTOR_END -->';
  const size = SIZE_MAP[options.size] || SIZE_MAP.medium;
  const contentFirstLine = [''];
  const lineMax = 6;
  const contentFirstLineData = list.splice(0, lineMax);
  contentFirstLineData.map((item, key) => {
    contentFirstLine.push(`[<img src="${item.avatar_url}" width="${size}px;"/><br/><sub><b>${item.login}</b></sub>](${item.html_url})<br/>`);
  });
  contentFirstLine.push('');
  const contentRemaining = [];
  list.map((item, key) => {
    contentRemaining.push(`[<img src="${item.avatar_url}" width="${size}px;"/><br/><sub><b>${item.login}</b></sub>](${item.html_url})<br/>`);
  });

  const genLine = (number) => {
    const r = [];
    while (number--) {
      r.push(' :---: ');
    }
    return r;
  };

  const genLinesOfN = (content, n) => {
    const result = [];
    while (content.length > n) {
      let line = ['', ...content.splice(0, n), ''].join('|');
      result.push(line);
    }
    result.push(content.join('|'));
    return result;
  };

  const isZH = ifHasZh(readMeContext);
  const contributorTitle = isZH ? '贡献者' : 'Contributors';
  const footer = isZH ?
    `[git-contributor 说明](${pkg.homepage})，自动生成时间：\`${_.moment()}\`。` :
    `This project follows the git-contributor [spec](${pkg.homepage}), auto updated at \`${_.moment()}\`.`;

  const res = [
    startToken,
    '',
    `## ${contributorTitle}`,
    '',
    contentFirstLine.join('|'),
    `|${genLine(contentFirstLineData.length).join('|')}|`,
    ...genLinesOfN(contentRemaining, lineMax),
    '',
    footer,
    '',
    endToken
  ];

  return {
    content: res.join('\n'),
    startToken,
    endToken
  };
};
