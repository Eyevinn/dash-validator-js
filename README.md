A Javascript library to validate content with the MPEG DASH streaming format

## Usage (Node JS)

```
npm install --save dash-validator
```

Example implementation:

```
const DashValidator = require("dash-validator");

const validator = new DashValidator("http://example.com/test.mpd");
validator.load().then(() => {
  console.log("Loaded manifest");
  console.log(validator.duration());
  validator.verifyAllSegments(verifyFn).then(result => {
    console.log(result);
  });
}).catch(console.error);

function verifyFn(headers) {
  return (typeof headers["x-my-custom-header"] !== "undefined");
}
```