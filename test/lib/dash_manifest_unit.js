// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashManifest = require("../../lib/dash_manifest.js");

describe("DashManifest API", () => {
  it("can return type", () => {
    const mpd = new DashManifest({ type: "dynamic" });
    expect(mpd.type).toBe("dynamic");
  });

  it("can return availability start time in seconds", () => {
    const mpdA = new DashManifest({ availabilityStartTime: "1970-01-01T00:00:00Z" });
    expect(mpdA.availabilityStartTime).toBe(0);
    const mpdB = new DashManifest({ availabilityStartTime: "2016-12-24T09:04:06Z" });
    expect(mpdB.availabilityStartTime).toBe(1482570246);
    const mpdC = new DashManifest({ availabilityStartTime: "2016-12-35T09:04:06Z" });
    expect(mpdC.availabilityStartTime).toBe(null); 
  });

  it("can return publish time in seconds", () => {
    const mpd = new DashManifest({ publishTime: "2016-12-23T19:17:47.832317Z" });
    expect(mpd.publishTime).toBe(1482520667);
  });

  it("can return timeshift buffer depth in seconds", () => {
    const mpd = new DashManifest({ timeShiftBufferDepth: "PT1H" });
    expect(mpd.timeShiftBufferDepth).toBe(3600);
  });

  it("can return an array of periods", () => {
    const periods = [];
    periods.push({
      id: "1",
      start: 0,
      adaptationsSets: [{
        contentType: "audio",
        mimeType: "audio/mp4",
        bandwidth: { min: 96000, max: 96000 },
      }],
    });
    const mpd = new DashManifest({ periods: periods });
    expect(mpd.periods.length).toBe(1);
    expect(mpd.periods[0].id).toBe("1");
    expect(mpd.periods[0].start).toBe(0);
    expect(mpd.periods[0].adaptationsSets[0].contentType).toBe("audio");
  });
});
