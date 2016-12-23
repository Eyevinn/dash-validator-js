const DashParserModule = require("../../lib/dash_parser.js");
const TestAssetsModule = require("../support/testassets.js");

describe("Dash Parser", () => {
  it("can parse an MPEG DASH live manifest from USP", function t(done) {
    const testAssets = new TestAssetsModule();
    const asset = testAssets.getAssetByName("usp-live"); 
    const parser = new DashParserModule();
    parser.parse(asset.xml).then(done).catch(fail);
  });
});
