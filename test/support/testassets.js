jasmine.getFixtures().fixturesPath = '/base/test/support/testassets';

function loadAsset(name, file) {
  const data = readFixtures(file);
  return {
    name: name,
    xml: data
  };
}

const TestAssets = function constructor() {
  this.assets = [];

  this.assets.push(loadAsset("usp-live", "usp.live.mpd"));
};

TestAssets.prototype.getAssetByName = function(name) {
  return this.assets.find((n) => {
    return n.name === name;
  });
};

module.exports = TestAssets;
