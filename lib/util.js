// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)

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

module.exports = {
  durationInSeconds,
  dateInSeconds,  
}
