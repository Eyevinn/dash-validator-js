// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
const MockDate = require("mockdate");
const DashValidatorRunner = require("../../lib/dash_validator_runner.js");
const DashManifest = require("../../lib/dash_manifest.js");
const TestAssetsModule = require("../support/testassets.js");

describe("Dash Validator Runner", () => {
  let testAssets;
  let publishTime;

  beforeEach((done) => {
    testAssets = new TestAssetsModule();
    publishTime = new Date("2016-12-23T19:17:47.832317Z");
    jasmine.clock().install();
    done();
  });

  afterEach((done) => {
    MockDate.reset();
    jasmine.clock().uninstall();
    done();
  });

  // Disabled until I have figured out how to make the Jasmine clock tick
  // when a promise is pending
  xit("can handle a correct dynamic mpd", (done) => {
    let d = new Date("2017-01-23T17:15:00.000000Z");
    MockDate.set(d);
    let start = new Date("2017-01-23T16:15:00.000000Z");
    let dynamicMpd = 
      testAssets.generateDynamicManifest(publishTime, start, 3);
    let mpd = new DashManifest(dynamicMpd);
    const validatorRunner = new DashValidatorRunner(mpd, null, 10);
    let loopCount = 1;

    function mpdUpdater() {
      return new Promise((resolve) => {
        dynamicMpd =
          testAssets.generateDynamicManifest(publishTime,
                                            new Date(start.getTime() + (10000 * loopCount)), 3);                                 
        mpd = new DashManifest(dynamicMpd);
        validatorRunner.updateMpd(mpd, null);
        MockDate.set(d.getTime() + (10000 * loopCount));
        loopCount++;
        resolve();
      });
    }

    validatorRunner.start(3, mpdUpdater).then((result) => {
      expect(result.ok).toBe(3);
      expect(result.iterations).toBe(3);
      done();
    }).catch(fail).then(done);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
  }); 

  xit("can handle a stale dynamic mpd", (done) => {
    const d = new Date("2017-01-24T08:10:00.000000Z");
    MockDate.set(d);
    const start = new Date("2017-01-24T07:00:00.000000Z");
    const staleMpd = testAssets.generateDynamicManifest(publishTime, start, 3);
    let mpd = new DashManifest(staleMpd);
    const validatorRunner = new DashValidatorRunner(staleMpd, null, 10);
    let loopCount = 1;

    function mpdUpdater() {
      return new Promise((resolve) => {
        validatorRunner.updateMpd(mpd, null);
        MockDate.set(d.getTime() + (10000 * loopCount));
        loopCount++;
        resolve();
      });
    };
    validatorRunner.start(5, mpdUpdater).then((result) => {
      expect(result.ok).toBe(0);
      expect(result.iterations).toBe(5);
      done();
    });
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
    jasmine.clock().tick(10000);
  });
});