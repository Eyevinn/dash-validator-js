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
    get segments() {
      let segmentUrls = [];
      defaultFilterFn = function(as) {
        return (as.mimeType == "video/mp4");
      };
      filterFn = defaultFilterFn;
      this.mpd.periods.forEach((p) => {
        p.adaptationSets.filter(filterFn).forEach((as) => {
          as.representations.forEach((r) => {
            r.segments.forEach((seg) => {
              segmentUrls.push(p.baseUrl + seg.uri);
            });
          });
        });
      });
      return segmentUrls;
    },
    get totalDuration() {
      let duration = 0;
      if (this.mpd.type === "dynamic") { return undefined; }
      this.mpd.periods.forEach((p) => {
        p.adaptationSets.filter((as) => as.mimeType == "video/mp4").forEach((as) => {
          duration += as.representations[0].segments.map(s => s.durationInSeconds).reduce((total, value) => total + value);
        });
      });
      return duration;
    },
  };
  return self;
};

module.exports = DashManifest;
