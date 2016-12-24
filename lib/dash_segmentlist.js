// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashSegmentList = function constructor(timescale) {
  return { 
    ts: timescale,
    segmentList: [],
    get timescale() { return this.ts; },
    get segments() { return this.segmentList; },

    fromSegmentTimeline: function create(timeline) {
      let nextStart;

      for(let i=0; i<timeline.length; i++) {
        let count = timeline[i].r || 1;
        for (let j=0; j<count; j++) {
          const segment = {}; 
          if (timeline[i].t && !timeline[i].r) {
            segment.start = timeline[i].t / this.ts;
            nextStart = timeline[i].t + timeline[i].d;
          } else if (nextStart) {
            segment.start = nextStart / this.ts;
            nextStart = nextStart + timeline[i].d;
          }
          segment.end = segment.start + (timeline[i].d / this.ts);
          this.segmentList.push(segment);
        }
      }
    },
  };
};

module.exports = DashSegmentList;
