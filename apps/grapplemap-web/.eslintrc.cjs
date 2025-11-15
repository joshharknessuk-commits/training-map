/* eslint-env node */
const path = require('path');

module.exports = {
  root: true,
  extends: [path.resolve(__dirname, '../../packages/config/eslint-next.cjs')],
};
