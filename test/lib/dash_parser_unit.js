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
      done();
    }).catch(fail).then(done);
  });
});
