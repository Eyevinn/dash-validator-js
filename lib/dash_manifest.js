// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

function dateInSeconds(dateString) {
  if (!dateString)
    return null;

  var result = Date.parse(dateString);
  return (!isNaN(result) ? Math.floor(result / 1000.0) : null);
}

const DashManifest = function constructor(internalMpd) {
  const self = {
    mpd: internalMpd,
    get type() { return this.mpd.type; },
    get availabilityStartTime() { return dateInSeconds(this.mpd.availabilityStartTime); },
    get publishTime() { return dateInSeconds(this.mpd.publishTime); },
  };
  return self;
};

module.exports = DashManifest;
