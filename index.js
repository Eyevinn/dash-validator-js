// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DashParser = require("./lib/dash_parser.js");
const util = require("./lib/util.js");

const DashValidator = function constructor(src) {
  let self = {};
  self._src = src;
  self._manifest;
  self._base = "";

  self.load = function load() {
    return new Promise((resolve, reject) => {
      self._base = util.getBaseUrl(self._src) + "/";
      util.requestXml(self._src).then((xml) => {
        const parser = new DashParser();
        parser.parse(xml).then((manifest) => {
          self._manifest = manifest;
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  };

  self.verifyAllSegments = function verifyAllSegments() {
    return new Promise((resolve, reject) => {
      let failed = [];
      let ok = [];
      const segments = this._manifest.segments;
      let segmentsChecked = 0;
      let errors = 0;
      for (let i=0; i<segments.length; i++) {
        const seg = segments[i];
        console.log("Checking " + self._base + seg);
        util.sleep(50);
        util.requestHeaders(self._base + seg).then(headers => {
          if (isHeadersOk(headers)) {
            ok.push({ uri: seg });
          } else {
            failed.push({ uri: seg, headers: headers });
          }
          if (++segmentsChecked == segments.length) {
            resolve({ failed: failed, ok: ok });
          }
        }).catch(err => {
          console.error("Failed to get Headers", err);
          errors++;
          failed.push({ uri: seg });
        });  
      }
    });
  };

  self.duration = function duration() {
    return self._manifest.totalDuration;
  };

  return self;
};

function isHeadersOk(headers) {
  let headersOk = true;
  if (typeof headers["cache-control"] === "undefined" ||
      headers["access-control-expose-headers"].split(',').indexOf("Date") == -1 ||
      headers["access-control-expose-headers"].split(',').indexOf("x-cdn-forward") == -1 ||
      headers["access-control-allow-headers"].split(',').indexOf("origin") == -1 ||
      typeof headers["x-cdn-forward"] === "undefined")
  {
    headersOk = false;
  }
  return headersOk;
}

module.exports = DashValidator;
