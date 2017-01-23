// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashValidatorRunner = function constructor(mpd) {
  this.mpd = mpd;
  this.iterationCount = 1;
  this.result = {
    ok: 0,
  };
};

DashValidatorRunner.prototype.start = function start(iterations, mpdUpdateFn) {
  return new Promise((resolve, reject) => {
    function timerFn() {
      mpdUpdateFn();
      this.iterationCount++;
      this.result.ok++;
      if (this.iterationCount > iterations) {
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

module.exports = DashValidatorRunner;