module.exports = function (config) {
  var configuration = {
    basePath: '',
    frameworks: ['browserify', 'jasmine'],
    preprocessors: {
      'index.js': ['browserify', 'babel'],
      'lib/**/*.js': ['browserify', 'babel'],
      'test/**/*.js': ['browserify', 'babel'],
    },
    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/**/*_unit.js'
    ],
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity,
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
