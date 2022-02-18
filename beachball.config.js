const fs = require('fs');

const postbump = (packagePath, packageName, packageVersion) => {
  fs.rm(`${packagePath}\\CHANGELOG.json`, err => {
    if (err) {
      console.log(err.message);
      return;
    }
    return;
  });
};

// Overriding the default entry renderer so that it just shows the comment without the author.
const customRenderEntry = ChangelogEntry => `- ${ChangelogEntry.comment}`;

module.exports = {
  branch: 'origin/2.0-preview',
  bumpDeps: false,
  disallowedChangeTypes: ['prerelease'],
  generateChangelog: true,
  hooks: { postbump },
  ignorePatterns: ['.*ignore', '*config.js', '*.md', '**/test/**'],
  publish: false,
  push: false,
  scope: ['packages/teams-js'],
  changelog: {
    customRenderers: {
      renderEntry: customRenderEntry,
    },
  },
};
