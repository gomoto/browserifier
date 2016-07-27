import browserify = require('browserify');
import fs = require('fs');
import objectAssign = require('object-assign');


// Browserifier options
interface BrowserifierOptions {
  // add inline sourcemaps?
  debug: boolean; // default: false

  // turn on watch mode?
  watchify: boolean; // default: false

  // callback to call once watchify writes the bundle
  watchifyCallback: () => void; // default: noop

  // minify individual modules?
  uglifyify: boolean; // default: false

  // compile from typescript? override default tsify options.
  tsify: boolean | {}; // default: { project: 'tsconfig.json' }
}


class Browserifier {

  private b: Browserify.BrowserifyObject;
  private output: string;

  // entries: path(s) of bundle entry points
  // output: path of bundle output file
  constructor(
    entries: string | string[],
    output: string,
    options = <BrowserifierOptions> {}
  ) {
    var browserifyOptions = {};

    // watchify requires these browserify options
    if (options.watchify) {
      objectAssign(browserifyOptions, {
        cache: {},
        packageCache: {}
      });
    }

    // debug
    if (options.debug) {
      objectAssign(browserifyOptions, {
        debug: true
      });
    }

    // browserify instance
    var b = browserify(entries, browserifyOptions);

    // watchify
    if (options.watchify) {
      b.plugin(require('watchify'));
      b.on('update', (ids: string[]) => {
        console.log(ids);
        this.bundle(options.watchifyCallback);
      });
      b.on('log', console.log);
    }

    // tsify
    if (options.tsify) {
      var tsifyOptions = typeof options.tsify === 'object' ? options.tsify : { project: 'tsconfig.json' };
      b.plugin(require('tsify'), tsifyOptions);
    }

    // uglifyify
    if (options.uglifyify) {
      b.transform(require('uglifyify'));
    }

    this.b = b;
    this.output = output;
  }

  bundle(callback = () => {}) {
    this.b
    .bundle()
    .pipe(fs.createWriteStream(this.output))
    .on('error', (error: Object) => {
      console.error(error.toString());
    })
    .on('close', () => {
      callback();
    });
  }

}


export = Browserifier;
