// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const util = require("./util.js");

/**
 * @param {DashManifest} mpd Manifest to initiate with
 * @param {number} updateTime How often to run a validation iteration (in seconds)
 * @constructor
 */
const DashValidatorRunner = function constructor(mpd, headers, updateTime) {
  this.mpd = mpd;
  this.headers = this.lastHeaders = headers;
  this.updateTime = updateTime || 10;
  this.result = {
    ok: 0,
    iterations: 0,
    failed: [],
  };
  this.listeners = [];
};

/**
 * Start Dash Validator runner to validate dynamically updated 
 * MPEG DASH manifests, such as used for live streams
 * 
 * @param {number} iterations Number of iterations to run
 * @param {Function} mpdUpdateFn Function that is called to update manifest
 * @param {Function} _optIterator Used for testing purposes
 */
DashValidatorRunner.prototype.start = function start(iterations, mpdUpdateFn, _optIterator) {
  return new Promise((resolve, reject) => {
    function timerFn() {
      mpdUpdateFn().then(() => {
        let allOk = true;
        this.trigger("checking", { mpd: this.mpd, headers: this.headers });
        if (!hasValidPlayhead(this.mpd)) {
          let failed = {};
          failed.iteration = this.result.iterations;
          failed.reason = "Time at playhead is invalid";
          failed.timeAtHead = new Date(this.mpd.timeAtHead).toISOString();
          failed.timeNow = new Date().toISOString();
          this.trigger("invalidplayhead", failed);
          this.result.failed.push(failed);
          allOk = false;      
        }
        if (this.headers && !hasValidHeaders(this.lastHeaders, this.headers)) {
          let failed = {};
          failed.iteration = this.result.iterations;
          failed.reason = "Invalid headers";
          failed.headers = this.headers;
          this.trigger("invalidheaders", failed);
          this.result.failed.push(failed);
          allOk = false;
        }
        if (allOk) {
          this.result.ok++;      
        }
        this.result.iterations++;
        this.lastHeaders = this.headers;
        if (this.result.iterations >= iterations) {
          resolve(this.result);
        } else {
          setTimeout(timerFn.bind(this), this.updateTime * 1000);
        }
      });
    }

    setTimeout(timerFn.bind(this), this.updateTime * 1000);
    if (_optIterator) {
      _optIterator();
    }
  });
};

/**
 * @param {DashManifest} mpd Updated manifest
 * @param {Object} headers
 */
DashValidatorRunner.prototype.updateMpd = function updateMpd(mpd, headers) {
  this.mpd = mpd;
  this.headers = headers;
};


/**
 * @param {DashValidatorRunnerEvent} runnerEvent
 * @param {Function} fn
 */
DashValidatorRunner.prototype.on = function on(runnerEvent, fn) {
  const listener = {
    eventName: runnerEvent,
    fn: fn,
  };
  this.listeners.push(listener);
};

DashValidatorRunner.prototype.trigger = function trigger(runnerEvent, ...args) {
  this.listeners.filter(l => l.eventName == runnerEvent).forEach((l) => {
    if (l.fn) {
      if (args.length == 1) {
        l.fn(args[0]);
      } else {
        l.fn(args);
      }
    }
  });
};

/** Private functions */

/**
 * @param {DashManifest} mpd
 */
function hasValidPlayhead(mpd) {
  const now = Date.now();

  if (Math.abs(mpd.timeAtHead - now) > 20000) {
    return false;
  }
  return true;
}

function hasValidHeaders(lastHeaders, currentHeaders) {
  const lastDate = new Date(lastHeaders["date"]);
  const currentDate = new Date(currentHeaders["date"]);
  const lastModifiedDate = new Date(lastHeaders["last-modified"]);
  const currentModifiedDate = new Date(currentHeaders["last-modified"]);

  if (lastModifiedDate >= currentModifiedDate) {
    return false;
  }

  if (lastDate >= currentDate) {
    return false;
  }
  return true;
}

module.exports = DashValidatorRunner;