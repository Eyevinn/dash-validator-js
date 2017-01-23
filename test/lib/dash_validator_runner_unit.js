// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const MockDate = require("mockdate");
const DashValidatorRunner = require("../../lib/dash_validator_runner.js");
const DashManifest = require("../../lib/dash_manifest.js");
const TestAssetsModule = require("../support/testassets.js");

describe("Dash Validator Runner", () => {
  beforeEach((done) => {
    jasmine.clock().install();
    done();
  });

  afterEach((done) => {
    jasmine.clock().uninstall();
    done();
  });

  it("can handle a correct dynamic mpd", (done) => {
    const testAssets = new TestAssetsModule();
    let d = new Date("2017-01-23T17:15:00.000000Z");
    MockDate.set(d);
    let start = new Date("2017-01-23T16:15:00.000000Z");
    let dynamicMpd = 
      testAssets.generateDynamicManifest(new Date("2016-12-23T19:17:47.832317Z"),
                                         start, 3);
    let mpd = new DashManifest(dynamicMpd);
    const validatorRunner = new DashValidatorRunner(mpd);
    let loopCount = 1;

    function mpdUpdater() {
      dynamicMpd =
        testAssets.generateDynamicManifest(new Date("2016-12-23T19:17:47.832317Z"),
                                           new Date(start.getTime() + (10000 * loopCount)), 3);                                 
      mpd = new DashManifest(dynamicMpd);
      validatorRunner.updateMpd(mpd);
      MockDate.set(d.getTime() + (10000 * loopCount));
      loopCount++;
    }

    validatorRunner.start(3, mpdUpdater).then((result) => {
      expect(result.ok).toBe(3);
      done();
    }).catch(fail).then(done);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
  }); 
});