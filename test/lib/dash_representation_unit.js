// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashRepresentation = require("../../lib/dash_representation.js");
const DashSegmentList = require("../../lib/dash_segmentlist.js");

describe("DashRepresentation", () => {
  it("can handle four video representations", () => {
    const segmentList = new DashSegmentList({
      timescale: 25,
      media: "INTERSTELLAR(3541935_ISM)-$RepresentationID$-$Time$.dash",
      startNumber: 1,
    });
    segmentList.fromSegmentTimeline([ {t: 0, d: 75, r:3239}, {d:67} ]);
    expect(segmentList.media).toBe("INTERSTELLAR(3541935_ISM)-$RepresentationID$-$Time$.dash");
    const representations = [
      { id: "video=253000", width: 384, height: 216, codecs: "avc1.42401E" },
      { id: "video=1404000", width: 768, height: 432, codecs: "avc1.4D401E" },
      { id: "video=3216000", width: 1280, height: 720, codecs: "avc1.4D4032" },
      { id: "video=6002000", width: 1920, height: 1080, codecs: "avc1.4D4032" },
    ];
    representations.forEach((r) => {
      const representation = new DashRepresentation(r, segmentList);
      const segments = representation.segments;
      expect(segments.length).toBe(3240);
      expect(segments[0].uri).toBe("INTERSTELLAR(3541935_ISM)-" + r.id + "-0.dash");
      expect(segments[1].uri).toBe("INTERSTELLAR(3541935_ISM)-" + r.id + "-75.dash");
      expect(segments[2].uri).toBe("INTERSTELLAR(3541935_ISM)-" + r.id + "-150.dash");
      expect(segments[3239].uri).toBe("INTERSTELLAR(3541935_ISM)-" + r.id + "-242925.dash");
    });
  });
});
