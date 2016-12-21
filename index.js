// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashParser = require("./lib/dash_parser.js");

const DashValidator = function constructor(src) {
  let self;
  self._src = src;

  self.load = function load() {
    return new Promise((resolve, reject) => {
      resolve();
/*
      let parser = DashParser(self._src);
      parser.parse().then(resolve).catch(reject);
*/
    });
  }

  return self;
};

module.exports = DashValidator;
