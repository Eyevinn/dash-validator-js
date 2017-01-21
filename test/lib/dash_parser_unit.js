// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashParserModule = require("../../lib/dash_parser.js");
const TestAssetsModule = require("../support/testassets.js");

describe("Dash Parser", () => {
  it("can parse an MPEG DASH live manifest from USP", function t(done) {
    const testAssets = new TestAssetsModule();
    const asset = testAssets.getAssetByName("usp-live"); 
    const parser = new DashParserModule();
    parser.parse(asset.xml).then((mpd) => {
      expect(mpd.type).toBe("dynamic");
      expect(mpd.availabilityStartTime).toBe(0);
      expect(mpd.publishTime).toBe(1482520667);
      expect(mpd.timeShiftBufferDepth).toBe(3600);
      expect(mpd.periods.length).toBe(1);
      expect(mpd.periods[0].start).toBe(0);
      expect(mpd.periods[0].adaptationSets.length).toBe(3);
      expect(mpd.periods[0].adaptationSets[0].bandwidth.min).toBe(96000);

      const segments = mpd.periods[0].adaptationSets[0].segmentList.segments;
      expect(Math.floor(segments[0].start)).toBe(1482517136);

      done();
    }).catch(fail).then(done);
  });

  it("can parse an MPEG DASH vod manifest from USP", function t(done) {
    const testAssets = new TestAssetsModule();
    const asset = testAssets.getAssetByName("usp-vod");
    const parser = new DashParserModule();
    parser.parse(asset.xml).then((mpd) => {
      expect(mpd.type).toBe("static");

      expect(mpd.periods[0].adaptationSets[5].contentType).toBe("video");
      expect(mpd.periods[0].baseUrl).toBe("dash/");
      const segments = mpd.periods[0].adaptationSets[5].segmentList.segments;
      expect(segments.length).toBe(3240);
      expect(segments[0].start).toBe(0);
      expect(segments[0].end).toBe(3);
      expect(segments[1].t).toBe(75);

      const representations = mpd.periods[0].adaptationSets[5].representations;
      expect(representations.length).toBe(7);
      expect(representations[0].id).toBe("video=253000");
      representations[0].segments.forEach((seg) => {
        expect(seg.uri).toBe("INTERSTELLAR(3541935_ISM)-" + representations[0].id + "-" + seg.t + ".dash");
      });
      const numSegments = representations[0].segments.length;
      expect(representations[0].segments[numSegments-1].t).toBe(242925);
      done();
    }).catch(fail).then(done);
  });
});
