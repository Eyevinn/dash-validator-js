const DashValidator = require("../index.js");
const util = require("../lib/util.js");
const TestAssetsModule = require("./support/testassets.js");

let failCount;

describe("Dash Validator", () => {
  beforeEach((done) => {
    spyOn(util, "requestXml").and.callFake((uri) => {
      return new Promise((resolve, reject) => {
        const testAssets = new TestAssetsModule();
        const m = uri.match(/^.*\/(.*?)\.mpd$/);
        const asset = testAssets.getAssetByName(m[1]);
        resolve(asset.xml);
      });
    });

    failCount = 0;
    spyOn(util, "requestHeaders").and.callFake((uri) => {
      return new Promise((resolve, reject) => {
        const mockHeaders = {
          date: 'Thu, 12 Jan 2017 15:19:42 GMT',
          'content-type': 'video/mp4',
          'content-length': '24792',
          connection: 'close',
          'cache-control': 'max-age=2592000',
          etag: '"1"',
          expires: 'Sun, 12 Feb 2017 08:36:45 GMT',
          'last-modified': 'Thu, 12 Jan 2017 15:18:04 GMT',
          server: 'Apache/2.4.7 (Ubuntu)',
          'access-control-allow-headers': 'origin, range, x-cdn-forward',
          'access-control-allow-origin': '*',
          'access-control-expose-headers': 'Server,range,Date,x-cdn-forward',
          'timing-allow-origin': '*',
          'x-cdn-forward': 'Level3',
          'x-usp': 'version=1.7.18 (7923)',
          age: '623144',
          'accept-ranges': 'bytes'
        };
        const mockFailHeaders = {
          date: 'Thu, 12 Jan 2017 15:19:42 GMT',
          'content-type': 'video/mp4',
          'content-length': '24792',
          connection: 'close',
          etag: '"1"',
          'last-modified': 'Thu, 12 Jan 2017 15:18:04 GMT',
          server: 'Apache/2.4.7 (Ubuntu)',
          'access-control-allow-headers': 'range',
          'access-control-allow-origin': '*',
          'access-control-expose-headers': 'Server,range',
          'timing-allow-origin': '*',
          'x-usp': 'version=1.7.18 (7923)',
          age: '623144',
          'accept-ranges': 'bytes'
        };
        if (failCount < 5) {
          resolve(mockFailHeaders);
          failCount++;
        }
        resolve(mockHeaders);
      });
    });
    done();
  });

  it("can load and parse an MPD", (done) => {
    validator = new DashValidator("http://mock.example.com/usp-vod.mpd");
    validator.load().then(() => {
      const duration = validator.duration();
      expect(duration).toBe(9719.68);
      done();
    }).catch(fail).then(done);
  });

  it("can verify all segments", (done) => {
    validator = new DashValidator("http://mock.example.com/usp-vod.mpd");
    validator.load().then(() => {
      validator.verifyAllSegments().then(result => {
        expect(result.failed.length).toBe(5);
        result.failed.forEach(f => {
          expect(f.headers["cache-control"]).toBe(undefined);
          expect(f.headers["access-control-expose-headers"].split(',').indexOf("Date")).toBe(-1);
          expect(f.headers["access-control-expose-headers"].split(',').indexOf("x-cdn-forward")).toBe(-1);
          expect(f.headers["access-control-allow-headers"].split(',').indexOf("origin")).toBe(-1);
          expect(f.headers["x-cdn-forward"]).toBe(undefined);
        });
        done();
      });
    }).catch(fail).then(done);
  });
});
