// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

const DashRepresentation = function constructor(representation, segmentList) {
  let segments_ = [];
  segmentList.segments.forEach((s) => {
    const segment = {
      t: s.t,
      durationInSeconds: s.durationInSeconds,
      uri: uriFromTemplate(segmentList.media, representation.id, s.t),
    };
    segments_.push(segment);
  });

  return {
    id: representation.id,
    rendition: { w: representation.width, h: representation.height },
    codecs: representation.codecs,
    segmentUrls: segments_,

    get segments() { return this.segmentUrls; },
  };
};

function uriFromTemplate(template, id, time) {
  let s = template;
  s = s.replace(/\$RepresentationID\$/, id);
  s = s.replace(/\$Time\$/, time);
  return s;
}

module.exports = DashRepresentation;
