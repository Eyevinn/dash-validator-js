var fs = require('fs');

module.exports = function (config) {
  var configuration = {
    basePath: '',
    frameworks: ['browserify', 'jasmine-jquery', 'jasmine'],
    browserify: {
      debug: true,
      transform: [
        ['babelify', {plugins: ['babel-plugin-espower']}],
      ],
    },
    preprocessors: {
      'index.js': 'browserify',
      'lib/**/*.js': 'browserify',
      'test/**/*.js': 'browserify',
    },
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/**/*_unit.js',
      { pattern: 'test/support/testassets/*.mpd',
        watched: true,
        served: true,
        included: false
      }
    ],
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity,
    logLevel: config.LOG_INFO,
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    }
  };
  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }
  config.set(configuration);
};
