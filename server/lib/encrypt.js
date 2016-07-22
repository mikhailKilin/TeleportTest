'use strict';

const crypto = require('crypto');

exports.md5 = (x) => {
  let md5 = crypto.createHash('md5');
  md5.update(x);
  return md5.digest('hex');
};

exports.sha1 = (x) => {
  let shasum = crypto.createHash('sha1');
  shasum.update(x);

  return shasum.digest('hex');
};
