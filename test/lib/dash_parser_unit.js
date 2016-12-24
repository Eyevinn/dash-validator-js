const DashParserModule = require("../../lib/dash_parser.js");
const TestAssetsModule = require("../support/testassets.js");

describe("Dash Parser", () => {
  it("can parse an MPEG DASH live manifest from USP", function t(done) {
    const testAssets = new TestAssetsModule();
    const asset = testAssets.getAssetByName("usp-live"); 
    const parser = new DashParserModule();
    parser.parse(asset.xml).then((mpd) => {
      expect(mpd.type).toBe("dynamic");
      expect(mpd.availabilityStartTime).toBe(0);
      expect(mpd.publishTime).toBe(1482520667);
      done();
    }).catch(fail).then(done);
  });
});
