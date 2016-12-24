// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const DashManifest = require("./dash_manifest.js");

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

    resolve(new DashManifest(this.internalMpd));
  });
};

module.exports = DashParser;
