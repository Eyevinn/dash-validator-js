// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const util = require("./util.js");

const DashManifest = function constructor(internalMpd) {
  const self = {
    mpd: internalMpd,
    get type() { return this.mpd.type; },
    get availabilityStartTime() { return util.dateInSeconds(this.mpd.availabilityStartTime); },
    get publishTime() { return util.dateInSeconds(this.mpd.publishTime); },
    get timeShiftBufferDepth() { return util.durationInSeconds(this.mpd.timeShiftBufferDepth); },
    get periods() { return this.mpd.periods; },
  };
  return self;
};

module.exports = DashManifest;
