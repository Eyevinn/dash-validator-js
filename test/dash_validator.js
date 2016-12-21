const DashValidator = require("../index.js");

describe("Dash Validator", () => {
  it("loads manifest", function t(done) {
    const validator = DashValidator("test.mpd");
    validator.load().then(done).catch(fail);
  });
});
