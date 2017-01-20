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

  self.verifySegments = function verifySegments(verifyFn, segments) {
    return new Promise((resolve, reject) => {
      let failed = [];
      let ok = [];
      let segmentsChecked = 0;
      let errors = 0;
      let verify = verifyFn || defaultVerifyFn;
      for (let i=0; i<segments.length; i++) {
        const seg = segments[i];
        util.log("Checking " + self._base + seg);
        util.sleep(50);
        util.requestHeaders(self._base + seg).then(headers => {
          if (verify(headers)) {
            ok.push({ uri: seg });
          } else {
            failed.push({ uri: seg, headers: headers });
          }
          if (++segmentsChecked == segments.length) {
            resolve({ failed: failed, ok: ok });
          }
        }).catch((err) => {
          errors++;
          failed.push({ uri: seg, reason: err });
        });  
      }
    });
  };

  self.verifyAllSegments = function verifyAllSegments(verifyFn) {
    const segments = this._manifest.segments;
    return self.verifySegments(verifyFn, segments);
  };

  self.duration = function duration() {
    return self._manifest.totalDuration;
  };

  self.segmentUrls = function segmentUrls() {
    return this._manifest.segments;
  };

  return self;
};

function defaultVerifyFn(headers) {
  let headersOk = true;
  if (typeof headers["cache-control"] === "undefined" ||
      headers["access-control-expose-headers"].split(',').indexOf("Date") == -1 ||
      headers["access-control-allow-headers"].split(',').indexOf("origin") == -1)
  {
    headersOk = false;
  }
  return headersOk;
}

module.exports = DashValidator;
