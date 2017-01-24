// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

/**
 * @param {DashManifest} mpd Manifest to initiate with
 * @param {number} updateTime How often to run a validation iteration (in seconds)
 * @constructor
 */
const DashValidatorRunner = function constructor(mpd, updateTime) {
  this.mpd = mpd;
  this.updateTime = updateTime || 10;
  this.result = {
    ok: 0,
    iterations: 0,
  };
};

/**
 * Start Dash Validator runner to validate dynamically updated 
 * MPEG DASH manifests, such as used for live streams
 * 
 * @param {number} iterations Number of iterations to run
 * @param {Function} mpdUpdateFn Function that is called to update manifest
 */
DashValidatorRunner.prototype.start = function start(iterations, mpdUpdateFn) {
  return new Promise((resolve, reject) => {
    function timerFn() {
      mpdUpdateFn();
      if (isValidManifest(this.mpd)) {
        this.result.ok++;      
      }
      this.result.iterations++;
      if (this.result.iterations >= iterations) {
        resolve(this.result);
      }
      setTimeout(timerFn.bind(this), this.updateTime * 1000);
    }
    setTimeout(timerFn.bind(this), this.updateTime * 1000);    
  });
};

/**
 * @param {DashManifest} mpd Updated manifest
 */
DashValidatorRunner.prototype.updateMpd = function updateMpd(mpd) {
  this.mpd = mpd;
};

/** Private functions */

/**
 * @param {DashManifest} mpd
 */
function isValidManifest(mpd) {
  const now = Date.now();

  if (Math.abs(mpd.timeAtHead - now) > 2000) {
    return false;
  }
  return true;
}

module.exports = DashValidatorRunner;