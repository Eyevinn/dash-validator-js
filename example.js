const DashValidator = require("./index.js");

const validator = new DashValidator("http://lb-usp-dash-vod.cmore.se/catchup/ISMROOT/CFILM/2016-10-03/INTERSTELLAR(3541935_ISM).ism/INTERSTELLAR(3541935_ISM).mpd");
validator.load().then(() => {
  console.log("Loaded manifest");
  console.log(validator.duration());
  validator.verifyAllSegments(verifyFn).then(result => {
    console.log(result);
  });
}).catch(console.error);

function verifyFn(headers) {
  let headersOk = true;
  if (typeof headers["cache-control"] === "undefined" ||
      headers["access-control-expose-headers"].split(',').indexOf("Date") == -1 ||
      headers["access-control-expose-headers"].split(',').indexOf("x-cdn-forward") == -1 ||
      headers["access-control-allow-headers"].split(',').indexOf("origin") == -1 ||
      typeof headers["x-cdn-forward"] === "undefined")
  {
    headersOk = false;
  }
  return headersOk;
}
