// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const request = require("request");

const dateInSeconds = function(dateString) {
  if (!dateString)
    return null;

  var result = Date.parse(dateString);
  return (!isNaN(result) ? Math.floor(result / 1000.0) : null);
}

const durationInSeconds = function(durationString) {
  if (!durationString)
    return null;
    
  var re = '^P(?:([0-9]*)Y)?(?:([0-9]*)M)?(?:([0-9]*)D)?' +
           '(?:T(?:([0-9]*)H)?(?:([0-9]*)M)?(?:([0-9.]*)S)?)?$';
  var matches = new RegExp(re).exec(durationString);
    
  if (!matches) {
    return null;
  }

  // Note: Number(null) == 0 but Number(undefined) == NaN.
  var years = Number(matches[1] || null);
  var months = Number(matches[2] || null);
  var days = Number(matches[3] || null);
  var hours = Number(matches[4] || null);
  var minutes = Number(matches[5] || null);
  var seconds = Number(matches[6] || null);

  // Assume a year always has 365 days and a month always has 30 days.
  var d = (60 * 60 * 24 * 365) * years +
          (60 * 60 * 24 * 30) * months +
          (60 * 60 * 24) * days +
          (60 * 60) * hours +
          60 * minutes +
          seconds;
  return isFinite(d) ? d : null;
}

const findChildren = function(elem, name) {
  const children = Array.prototype.filter.call(elem.childNodes, function(child) {
    return child.tagName === name;
  });
  return children;
}

const toNumber = function(xmlattr) {
  if (typeof xmlattr !== "undefined" && xmlattr !== "") {
    return Number(xmlattr);
  }
  return undefined;
}

const getBaseUrl = function(uri) {
  const sp = uri.split("/");
  const baseUrl = sp.slice(0, -1).join("/");
  return baseUrl;
}

const requestXml = function(uri) {
  return new Promise((resolve, reject) => {
    request(uri, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      }
      reject(error);
    });
  });
}

const requestHeaders = function(uri) {
  return new Promise((resolve, reject) => {
    request({ method: "HEAD", url: uri }, (error, response, body) => {
      if (!error) {
        resolve(response.headers);
      }
      reject(error);
    });
  });
}

const sleep = function(millisec) {
  const date = new Date();
  do {
    d = new Date();
  } while (d - date < millisec);
}

const log = function(str, ...args) {
  if (args.length > 0) {
    console.log(str, args);
  } else {
    console.log(str);
  }
}

module.exports = {
  durationInSeconds,
  dateInSeconds,
  findChildren, 
  toNumber,
  requestXml,
  requestHeaders,
  getBaseUrl,
  sleep,
  log,
}
