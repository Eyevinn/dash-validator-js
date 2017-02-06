// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DOMParser = require("xmldom").DOMParser;

const DashManifest = require("./dash_manifest.js");
const DashSegmentList = require("./dash_segmentlist.js");
const DashRepresentation = require("./dash_representation.js");
const util = require("./util.js");

function parsePeriods(xml) {
  const periods = [];

  const children = util.findChildren(xml, "Period");
  for(let i=0; i<children.length; i++) {
    const periodXml = children[i];
    const period = {};
    period.id = periodXml.getAttribute("id");
    period.start = util.durationInSeconds(periodXml.getAttribute("start"));
    period.baseUrl = util.findChildren(periodXml, "BaseURL")[0].textContent;
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
    as.representations = [];
    as.bandwidth = {
      min: Number(asXml.getAttribute("minBandwidth")),
      max: Number(asXml.getAttribute("maxBandwidth")),
    };
    const segmentTemplateXmlChildren = util.findChildren(asXml, "SegmentTemplate");
    if (segmentTemplateXmlChildren.length > 0) {
      const segmentTemplateXml = segmentTemplateXmlChildren[0];
      const timescale = segmentTemplateXml.getAttribute("timescale");
      const media = segmentTemplateXml.getAttribute("media");
      const segmentXmlChildren = util.findChildren(segmentTemplateXml, "SegmentTimeline");
      const segmentListXmlChildren = util.findChildren(segmentXmlChildren[0], "S");
      const timeline = [];
      for (let j=0; j<segmentListXmlChildren.length; j++) {
        const segmentXml = segmentListXmlChildren[j];
        const s = {};
        s.t = util.toNumber(segmentXml.getAttribute("t"));
        s.d = util.toNumber(segmentXml.getAttribute("d"));
        s.r = util.toNumber(segmentXml.getAttribute("r"));
        timeline.push(s);
      }
      const segmentList = new DashSegmentList({ 
        timescale: timescale, 
        media: media,
      });
      segmentList.fromSegmentTimeline(timeline);
      as.segmentList = segmentList;
    }
    util.findChildren(asXml, "Representation").forEach((reprXml) => {
      const representation = new DashRepresentation({
        id: reprXml.getAttribute("id"),
        width: util.toNumber(reprXml.getAttribute("width")),
        height: util.toNumber(reprXml.getAttribute("height")),
        codecs: reprXml.getAttribute("codecs"), 
      }, as.segmentList);
      as.representations.push(representation);
    });
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
    const mpdXml = this.internalMpd.xml;
    this.internalMpd.type = mpdXml.getAttribute("type") || "static";
    this.internalMpd.availabilityStartTime = mpdXml.getAttribute("availabilityStartTime");
    this.internalMpd.publishTime = mpdXml.getAttribute("publishTime");
    this.internalMpd.timeShiftBufferDepth = mpdXml.getAttribute("timeShiftBufferDepth");
    this.internalMpd.periods = parsePeriods(mpdXml);

    resolve(new DashManifest(this.internalMpd));
  });
};

module.exports = DashParser;
