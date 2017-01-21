// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DashParser = require("./lib/dash_parser.js");
const util = require("./lib/util.js");

/**
 * MPEG DASH Validator
 * 
 * A Javascript library that can be used to validate MPEG DASH streams (VOD and Live).
 * Source available on {@link https://github.com/Eyevinn/dash-validator-js GitHub}
 * 
 * @module dash-validator
 */

/**
 * Creates a new Dash Validator object
 * @constructor
 * 
 * @param {string} src URI to MPEG DASH manifest, e.g. http://example.com/example.mpd
 * @returns {DashValidator}
 */
const DashValidator = function constructor(src) {
  this._src = src;
  this._manifest;
  this._base = "";
  this._manifestHeaders;
};

/**
 * Download and parses MPEG DASH manifest
 * 
 * @returns {Promise} a Promise that resolves when the manifest is downloaded and parsed. 
 */
DashValidator.prototype.load = function load() {
  return new Promise((resolve, reject) => {
    this._base = util.getBaseUrl(this._src) + "/";
    util.requestXml(this._src).then(resp => {
      this._manifestHeaders = resp.headers;

      const parser = new DashParser();
      parser.parse(resp.xml).then((manifest) => {
        this._manifest = manifest;
        resolve();
      }).catch(reject);
    }).catch(reject);
  });
};

/**
 * @typedef FailedInfo
 * @type {Object}
 * @property {string} uri URI to the segment that failed
 * @property {Object} headers The actual HTTP response headers 
 */

/**
 * @typedef SuccessInfo
 * @type {Object}
 * @property {string} uri URI to the successful segment
 */

/**
 * @typedef SegmentVerifyResult
 * @type {Object}
 * @property {Array.<FailedInfo>} failed An array of all segments that failed
 * @property {Array.<SuccessInfo>} ok An array of all segments that were ok
 */

/**
 * @typedef ManifestVerifyResult
 * @type {Object}
 * @property {boolean} ok True if successful
 * @property {Object} headers The response headers for the manifest request.
 */

/**
 * Verifies that the timestamp of the last segment for a MPEG DASH live-stream
 * does not differ more than 10 seconds (default) from actual time.
 * 
 * This is only applicable for live-streams and for VOD will always return OK
 * 
 * @typedef TimestampResult
 * @type {Object}
 * @property {string} clock "OK" if ok or "BAD" if diff > allowedDiff
 * @property {string} clockOffset The actual diff between last segment and now
 * 
 * @param {number} allowedDiff The allowed diff (in millisec, default is 10000)
 * @returns {Promise.<TimestampResult>} a Promise that resolves when the timing has been checked.
 */
DashValidator.prototype.verifyTimestamps = function verifyTimestamps(allowedDiff) {
  return new Promise((resolve, reject) => {
    const diffCriteria = allowedDiff || 10000;
    const result = {};
    if (this._manifest.type === "static") {
      result.clock = "OK";
    } else {
      const timeAtHead = this._manifest.timeAtHead;
      const d = new Date().getTime();
      if (Math.abs(timeAtHead - d) > diffCriteria) {
        result.clock = "BAD";
        result.clockOffset = Math.abs(timeAtHead - d);
      }
    }
    resolve(result);
  });
}

/**
 * Verify that a list of segments can be downloaded and have correct HTTP headers
 * Applicable for both live and VOD.
 * 
 * @param {Function(Object)} verifyFn Function that is called to verify a segment.
 *    If not provided a default will be used
 * @param {Array.<string>} segments An array of segment URIs
 * @returns {Promise.<SegmentVerifyResult>} a Promise that resolves when all segments are verified.
 */
DashValidator.prototype.verifySegments = function verifySegments(verifyFn, segments) {
  return new Promise((resolve, reject) => {
    let failed = [];
    let ok = [];
    let segmentsChecked = 0;
    let errors = 0;
    const verify = verifyFn || defaultVerifyFn;
    for (let i=0; i<segments.length; i++) {
      const seg = segments[i];
      util.sleep(50);
      util.requestHeaders(this._base + seg).then(headers => {
        util.log("Checking " + this._base + seg);
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

/**
 * Verify that the manifest is ok.
 * 
 * @param {Function(headers, type)} verifyFn Function that is called to verify a segment.
 *   If not provided a default will be used.
 * @returns {Promise.<ManifestVerifyResult>} a Promise that resolves when the manifest
 *   is verified.
 */
DashValidator.prototype.verifyManifest = function verifyManifest(verifyFn) {
  return new Promise((resolve, reject) => {
    const verify = verifyFn || defaultManifestVerifyFn;
    const result = {};
    result.ok = verify(this._manifestHeaders, this._manifest.type);
    result.headers = this._manifestHeaders;
    resolve(result);
  });
};

/**
 * Verify that all segments referred to by this MPEG DASH manifest is OK
 * 
 * @param {Function(Object)} verifyFn Function that is called to verify a segment.
 *    If not provided a default will be used
 * @returns {Promise.<SegmentVerifyResult>} a Promise that resolves when all segments are verified.
 */
DashValidator.prototype.verifyAllSegments = function verifyAllSegments(verifyFn) {
  const segments = this._manifest.segments;
  return this.verifySegments(verifyFn, segments);
};

/**
 * @returns {number} the total duration of the MPEG DASH manifest
 */
DashValidator.prototype.duration = function duration() {
  return this._manifest.totalDuration;
};

/**
 * @returns {Array.<string>} an array with all segment URIs referred to by this
 *   MPEG DASH manifest
 */
DashValidator.prototype.segmentUrls = function segmentUrls() {
  return this._manifest.segments;
};

/** Private functions */

/** @private */
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

function defaultManifestVerifyFn(headers, type) {
  if (type == "dynamic") {
    if (!headers["cache-control"]) {
      return false;
    }
    const m = headers["cache-control"].match(/max-age=(\d+)/);
    if (!m) {
      return false;
    }
    if (m[1] > 10) {
      // Max age for dynamic manifest should not cache this long
      return false;
    }
  }
  return true;
}

/** Create a Dash Validator object */
module.exports = DashValidator;
