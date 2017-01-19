// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashSegmentList = require("../../lib/dash_segmentlist.js");

describe("DashSegmentList", () => {

  it("can handle a timeline based on segment template", () => {
    const segmentList = new DashSegmentList({
      timescale: 48000,
    });
    const timeline = [
      { t: 71160822564966, d: 96256 },
      { d: 95232 },
      { d: 96256, r: 2 },
    ];
    segmentList.fromSegmentTimeline(timeline);
    expect(segmentList.timescale).toBe(48000);
    expect(Math.floor(segmentList.segments[0].start)).toBe(1482517136);
    expect(segmentList.segments[0].t).toBe(71160822564966);
    expect(Math.floor(segmentList.segments[1].start)).toBe(1482517138);
    expect(Math.floor(segmentList.segments[2].start)).toBe(1482517140);
    expect(segmentList.segments.length).toBe(4);
  });
  it("can handle a VOD timeline based on segment template", () => {
    const segmentList = new DashSegmentList({
      timescale: 25,
    });
    const timeline = [
      { t: 0, d: 75, r: 3239 },
      { d: 67 },
    ];
    segmentList.fromSegmentTimeline(timeline);
    expect(segmentList.timescale).toBe(25);
    expect(segmentList.segments.length).toBe(3240);
    expect(segmentList.segments[0].start).toBe(0);
    expect(segmentList.segments[0].end).toBe(3);
    expect(segmentList.segments[1].t).toBe(75);
    expect(segmentList.segments[1].durationInSeconds).toBe(3);
    expect(segmentList.segments[3239].t).toBe(242925);
  });
});
