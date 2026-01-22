'use strict';

const assert = require('assert');
const fs = require('fs');
const Module = require('module');
const os = require('os');
const path = require('path');

const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'git-contributor-'));

const uniq = list => Array.from(new Set(list));

const loadContributor = ({
  execSync,
  request,
  isExistedFile,
  isExistedDir,
  moment
} = {}) => {
  const stubs = {
    child_process: {
      execSync: execSync || (() => Buffer.from(''))
    },
    urllib: {
      request: request || (() => Promise.resolve({ data: [] }))
    },
    xutil: {
      uniq,
      moment: moment || (() => 'NOW'),
      isExistedFile: isExistedFile || (() => false),
      isExistedDir: isExistedDir || (() => false)
    }
  };
  const originalLoad = Module._load;
  const modulePath = path.join(__dirname, '..', 'lib', 'git-contributor');
  Module._load = (requestName, parent, isMain) => {
    if (stubs[requestName]) {
      return stubs[requestName];
    }
    return originalLoad(requestName, parent, isMain);
  };
  delete require.cache[require.resolve(modulePath)];
  try {
    return require(modulePath);
  } finally {
    Module._load = originalLoad;
  }
};

describe('git-contributor', () => {
  afterEach(() => {
    delete process.env.OAUTH_TOKEN;
  });

  it('gets authors from package repository url', async () => {
    const cwd = makeTempDir();
    const pkgPath = path.join(cwd, 'package.json');
    fs.writeFileSync(pkgPath, JSON.stringify({
      repository: {
        url: 'git@github.com:foo/bar.git'
      }
    }));

    process.env.OAUTH_TOKEN = 'token-123';

    const request = async (uri, options) => {
      assert.equal(options.headers.Authorization, 'token token-123');
      assert.equal(/\/contributors\?per_page=100$/.test(uri), true);
      return {
        data: [
          {
            login: 'alpha',
            avatar_url: 'avatar-a',
            html_url: 'html-a',
            extra: 'ignored'
          }
        ]
      };
    };

    const contributor = loadContributor({
      request,
      isExistedFile: filePath => filePath === pkgPath,
      isExistedDir: () => false
    });

    const list = await contributor.getAuthor({ cwd });
    assert.deepEqual(list, [
      {
        login: 'alpha',
        avatar_url: 'avatar-a',
        html_url: 'html-a'
      }
    ]);
  });

  it('gets authors from provided repo url when package is missing', async () => {
    const request = async (uri) => {
      assert.equal(/https:\/\/api.github.com\/repos\/foo\/bar\/contributors/.test(uri), true);
      return {
        data: [
          {
            login: 'beta',
            avatar_url: 'avatar-b',
            html_url: 'html-b'
          }
        ]
      };
    };

    const contributor = loadContributor({
      request,
      isExistedFile: () => false,
      isExistedDir: () => false
    });

    const list = await contributor.getAuthor({
      cwd: makeTempDir(),
      url: 'https://github.com/foo/bar'
    });

    assert.deepEqual(list, [
      {
        login: 'beta',
        avatar_url: 'avatar-b',
        html_url: 'html-b'
      }
    ]);
  });

  it('returns empty list when package parsing fails and .git is missing', async () => {
    const cwd = makeTempDir();
    const pkgPath = path.join(cwd, 'package.json');
    fs.writeFileSync(pkgPath, '{invalid json');

    const contributor = loadContributor({
      isExistedFile: filePath => filePath === pkgPath,
      isExistedDir: () => false
    });

    const list = await contributor.getAuthor({ cwd });
    assert.deepEqual(list, []);
  });

  it('falls back to git log and search api', async () => {
    process.env.OAUTH_TOKEN = 'token-456';

    const execSync = () => Buffer.from([
      'Alice <alice@example.com>',
      'Bob <bob@example.com>',
      'Alice <alice@example.com>',
      ''
    ].join('\n'));

    const request = async (uri, options) => {
      assert.equal(options.headers.Authorization, 'token token-456');
      const query = decodeURIComponent(uri.split('q=')[1]);
      const email = query.split(' ')[0].replace(/[<>]/g, '');
      if (email === 'alice@example.com') {
        return {
          data: {
            total_count: 1,
            items: [
              {
                login: 'alice',
                avatar_url: 'avatar-a',
                html_url: 'html-a'
              }
            ]
          }
        };
      }
      return { data: { total_count: 0, items: [] } };
    };

    const contributor = loadContributor({
      execSync,
      request,
      isExistedFile: () => false,
      isExistedDir: () => true
    });

    const list = await contributor.getAuthor({ cwd: makeTempDir() });
    assert.deepEqual(list, [
      {
        login: 'alice',
        avatar_url: 'avatar-a',
        html_url: 'html-a'
      }
    ]);
  });

  it('falls back to git log without auth token', async () => {
    const execSync = () => Buffer.from([
      'Nova <nova@example.com>'
    ].join('\n'));

    const request = async (uri, options) => {
      assert.equal(Object.prototype.hasOwnProperty.call(options.headers, 'Authorization'), false);
      const query = decodeURIComponent(uri.split('q=')[1]);
      const email = query.split(' ')[0].replace(/[<>]/g, '');
      assert.equal(email, 'nova@example.com');
      return {
        data: {
          total_count: 1,
          items: [
            {
              login: 'nova',
              avatar_url: 'avatar-n',
              html_url: 'html-n'
            }
          ]
        }
      };
    };

    const contributor = loadContributor({
      execSync,
      request,
      isExistedFile: () => false,
      isExistedDir: () => true
    });

    const list = await contributor.getAuthor();
    assert.deepEqual(list, [
      {
        login: 'nova',
        avatar_url: 'avatar-n',
        html_url: 'html-n'
      }
    ]);
  });

  it('generates markdown for english and chinese content', () => {
    const contributor = loadContributor();
    const list = [
      { login: 'a', avatar_url: 'u1', html_url: 'h1' },
      { login: 'b', avatar_url: 'u2', html_url: 'h2' },
      { login: 'c', avatar_url: 'u3', html_url: 'h3' },
      { login: 'd', avatar_url: 'u4', html_url: 'h4' },
      { login: 'e', avatar_url: 'u5', html_url: 'h5' },
      { login: 'f', avatar_url: 'u6', html_url: 'h6' },
      { login: 'g', avatar_url: 'u7', html_url: 'h7' },
      { login: 'h', avatar_url: 'u8', html_url: 'h8' },
      { login: 'i', avatar_url: 'u9', html_url: 'h9' },
      { login: 'j', avatar_url: 'u10', html_url: 'h10' },
      { login: 'k', avatar_url: 'u11', html_url: 'h11' },
      { login: 'l', avatar_url: 'u12', html_url: 'h12' },
      { login: 'm', avatar_url: 'u13', html_url: 'h13' },
      { login: 'n', avatar_url: 'u14', html_url: 'h14' }
    ];

    const zh = contributor.genMarkDown(list.slice(), '这是中文内容用于判断。');
    assert.equal(/## 贡献者/.test(zh.content), true);
    assert.equal(/git-contributor 说明/.test(zh.content), true);
    assert.equal(/GITCONTRIBUTOR_START/.test(zh.content), true);
    assert.equal(/GITCONTRIBUTOR_END/.test(zh.content), true);
    assert.equal((zh.content.match(/img src/g) || []).length > 12, true);

    const en = contributor.genMarkDown(list.slice(0, 1), 'English readme');
    assert.equal(/## Contributors/.test(en.content), true);
    assert.equal(/auto updated/.test(en.content), true);
  });
});
