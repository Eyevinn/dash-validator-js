// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashValidatorRunner = function constructor(mpd) {
  this.mpd = mpd;
  this.result = {
    ok: 0,
    iterations: 0,
  };
};

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
      setTimeout(timerFn.bind(this), 10000);
    }
    setTimeout(timerFn.bind(this), 10000);    
  });
};

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