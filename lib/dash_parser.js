// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DashManifest = require("./dash_manifest.js");
const DashSegmentList = require("./dash_segmentlist.js");
const util = require("./util.js");

function parsePeriods(xml) {
  const periods = [];

  const children = util.findChildren(xml, "Period");
  for(let i=0; i<children.length; i++) {
    const periodXml = children[i];
    const period = {};
    period.id = periodXml.getAttribute("id");
    period.start = util.durationInSeconds(periodXml.getAttribute("start"));
    period.adaptationSets = parseAdaptationSets(periodXml);
    periods.push(period);
  }

  return periods;  
}

function parseAdaptationSets(periodXml) {
  const adaptationsSets = [];
  const children = util.findChildren(periodXml, "AdaptationSet");
  
  for(let i=0; i<children.length; i++) {
    const asXml = children[i];
    const as = {};
    as.contentType = asXml.getAttribute("contentType");
    as.mimeType = asXml.getAttribute("mimeType");
    as.bandwidth = {
      min: Number(asXml.getAttribute("minBandwidth")),
      max: Number(asXml.getAttribute("maxBandwidth")),
    };
    const segmentTemplateXmlChildren = util.findChildren(asXml, "SegmentTemplate");
    if (segmentTemplateXmlChildren.length > 0) {
      const segmentTemplateXml = segmentTemplateXmlChildren[0];
      const timescale = segmentTemplateXml.getAttribute("timescale");
      const segmentXmlChildren = util.findChildren(segmentTemplateXml, "SegmentTimeline");
      const segmentListXmlChildren = util.findChildren(segmentXmlChildren[0], "S");
      const timeline = [];
      for (let j=0; j<segmentListXmlChildren.length; j++) {
        const segmentXml = segmentListXmlChildren[j];
        const s = {};
        s.t = segmentXml.getAttribute("t");
        s.d = segmentXml.getAttribute("d");
        s.r = segmentXml.getAttribute("r");
        timeline.push(s);
      }
      const segmentList = new DashSegmentList(timescale);
      segmentList.fromSegmentTimeline(timeline);
      as.segments = segmentList.segments;
    }
    adaptationsSets.push(as);
  }

  return adaptationsSets;
}

const DashParser = function constructor() {
  this.internalMpd = {};
  return this;
};

DashParser.prototype.parse = function parse(string) {
  let parser = new DOMParser();
  let xml = null;

  return new Promise((resolve, reject) => {
    try {
      xml = parser.parseFromString(string, "text/xml");
    } catch (exception) { reject(exception); }
    if (xml) {
      if (xml.documentElement.tagName == "MPD") {
        this.internalMpd.xml = xml.documentElement;
      }
    }
    if (!this.internalMpd.xml) {
      reject("Invalid XML");
    }
    mpdXml = this.internalMpd.xml;
    this.internalMpd.type = mpdXml.getAttribute("type") || "static";
    this.internalMpd.availabilityStartTime = mpdXml.getAttribute("availabilityStartTime");
    this.internalMpd.publishTime = mpdXml.getAttribute("publishTime");
    this.internalMpd.timeShiftBufferDepth = mpdXml.getAttribute("timeShiftBufferDepth");
    this.internalMpd.periods = parsePeriods(mpdXml);

    resolve(new DashManifest(this.internalMpd));
  });
};

module.exports = DashParser;
