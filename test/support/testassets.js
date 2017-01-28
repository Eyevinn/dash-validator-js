jasmine.getFixtures().fixturesPath = '/base/test/support/testassets';

function loadAsset(name, file) {
  const data = readFixtures(file);
  return {
    name: name,
    xml: data
  };
}

const TestAssets = function constructor() {
  this.assets = [];

  this.assets.push(loadAsset("usp-live", "usp.live.mpd"));
  this.assets.push(loadAsset("usp-vod", "usp.vod.mpd"));
  this.assets.push(loadAsset("dynamic.1.mpd", "dynamic.1.mpd"));
  this.assets.push(loadAsset("dynamic.2.mpd", "dynamic.2.mpd"));
  this.assets.push(loadAsset("dynamic.3.mpd", "dynamic.3.mpd"));
};

TestAssets.prototype.getAssetByName = function(name) {
  return this.assets.find((n) => {
    return n.name === name;
  });
};

/**
 * @param {Date} publishTime
 * @param {Date} startTime
 * @param {number} segmentLength
 * @return {Object} Internal MPD object that is used to create a DashManifest object
 */
TestAssets.prototype.generateDynamicManifest = function(publishTime, startTime, segmentLength) {
  const internalMpd = {
    type: "dynamic",
    availabilityStartTime: "1970-01-01T00:00:00Z",
    minBufferTime: "PT10S",
    timeshiftBufferDepth: "PT1H",
    maxSegmentDuration: "PT" + segmentLength + "S",
    publishTime: publishTime.toISOString(),
  };

  const adaptationSetAudio = {
    contentType: "audio",
    mimeType: "audio/mp4",
    bandwidth: {
      min: 96000,
      max: 96000,
    },
  };
  adaptationSetAudio.segmentList = 
    this.createMockSegmentList(48000, 
                               startTime, 3600, 
                               segmentLength, "live-$RepresentationID$-$Time$.dash");
  adaptationSetAudio.representations = [ 
    this.createMockRepresentation(adaptationSetAudio.segmentList, 96000, "audio101_swe=96000")
  ];

  const adaptationSetVideo = {
    contentType: "video",
    mimeType: "video/mp4",
    bandwidth: {
      min: 254000,
      max: 254000,
    },
  };
  adaptationSetVideo.segmentList = 
    this.createMockSegmentList(25, startTime, 3600, 
                               segmentLength, "live-$RepresentationID$-$Time$.dash");
  adaptationSetVideo.representations = [
    this.createMockRepresentation(adaptationSetVideo.segmentList, 254000, "video=254000", 384, 216)
  ];

  const period = {
    id: "1",
    start: "PT0S",
    baseUrl: "dash/",
    adaptationSets: [ adaptationSetAudio, adaptationSetVideo ],
  };

  internalMpd.periods = [ period ];

  return internalMpd;
};

/**
 * @param {number} timescale
 * @param {Date} startTime
 * @param {number} duration (seconds)
 * @param {number} segmentLength
 * @param {string} mediaTemplate
 */
TestAssets.prototype.createMockSegmentList = function(timescale, startTime, duration, segmentLength, mediaTemplate) {
  let segmentList = [];

  for (let i=0; i<(duration/segmentLength); i++) {
    const segment = {
      start: (startTime.getTime() / 1000),
      t: (startTime.getTime() / 1000) * timescale,
      durationInSeconds: segmentLength,
      end: (startTime.getTime() / 1000) + duration,
    };
    segmentList.push(segment);
  }
  return {
    get timescale() { return timescale; },
    get media() { return mediaTemplate; },
    get segments() { return segmentList; },
  };
};

TestAssets.prototype.createMockRepresentation = function(segmentList, bandwidth, id, width, height) {
  const segments_ = [];
  segmentList.segments.forEach((s) => {
    segments_.push({
      t: s.t,
      start: s.start,
      end: s.end,
      durationInSeconds: s.durationInSeconds,
      uri: uriFromTemplate(segmentList.media, id, s.t),
    });
  });
  return {
    id: id,
    get segments() { return segments_; },
  };
};

function uriFromTemplate(template, id, time) {
  let s = template;
  s = s.replace(/\$RepresentationID\$/, id);
  s = s.replace(/\$Time\$/, time);
  return s;
}

module.exports = TestAssets;
