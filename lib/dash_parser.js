// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DashManifest = require("./dash_manifest.js");
const util = require("./util.js");

function parsePeriods(xml) {
  let periods = [];

  const children = Array.prototype.filter.call(xml.childNodes, function(child) {
    return child.tagName === 'Period';
  });
  for(let i=0; i<children.length; i++) {
    const periodXml = children[i];
    let period = {};
    period.id = periodXml.getAttribute("id");
    period.start = util.durationInSeconds(periodXml.getAttribute("start"));
    periods.push(period);
  }

  return periods;  
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
