// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashSegmentList = require("../../lib/dash_segmentlist.js");

describe("DashSegmentList", () => {

  it("can handle a timeline based on segment template", () => {
    const segmentList = new DashSegmentList(48000);
    const timeline = [
      { t: 71160822564966, d: 96256 },
      { d: 95232 },
      { d: 96256, r: 2 },
    ];
    segmentList.fromSegmentTimeline(timeline);
    expect(segmentList.timescale).toBe(48000);
    expect(Math.floor(segmentList.segments[0].start)).toBe(1482517136);
    expect(Math.floor(segmentList.segments[1].start)).toBe(1482517138);
    expect(Math.floor(segmentList.segments[2].start)).toBe(1482517140);
    expect(segmentList.segments.length).toBe(4);
  });
});
