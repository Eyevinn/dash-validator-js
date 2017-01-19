const DashValidator = require("./index.js");

const validator = new DashValidator("http://lb-usp-dash-vod.cmore.se/catchup/ISMROOT/CFILM/2016-10-03/INTERSTELLAR(3541935_ISM).ism/INTERSTELLAR(3541935_ISM).mpd");
validator.load().then(() => {
  console.log("Loaded manifest");
  console.log(validator.duration());
  validator.verifyAllSegments().then(result => {
    console.log(result);
  });
}).catch(console.error);