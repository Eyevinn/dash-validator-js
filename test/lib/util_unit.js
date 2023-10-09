const util = require("../../lib/util.js");
const request = require("request");
const TestAssetsModule = require("../support/testassets.js");

describe("Util Function", () => {
  describe("request helpers", () => {
    it("can request an XML body", (done) => {
      const testAssets = new TestAssetsModule();
      const asset = testAssets.getAssetByName("usp-vod");
      spyOn(request, "get").and.callFake((url, callback) => {
        callback(null, { statusCode: 200, headers: {} }, asset.xml);
      });
      const expectedResponse = {
        xml: asset.xml,
        headers: {},
      };
      util.requestXml("http://mock.example.com/test.mpd").then((response) => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe("getRandomItem", () => {
    it("returns a random item from an array", () => {
      spyOn(Math, "random").and.returnValue(0.3);
      const array = [{ a: 5 }, {a: 7}, {a: 9}, {a: 11}, {a: 20}];
      const itm = util.getRandomItem(array);
      expect(itm).toEqual({a: 7});
    });
  });
});