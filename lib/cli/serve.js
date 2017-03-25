/*!
 * Module dependencies.
 */
var phonegap = require('../main'),
    console = require('./util/console'),
    PhoneGap = require('../phonegap'),
    fs = require('fs'),
    path = require('path'),
    gaze = require('gaze'),
    pg = new PhoneGap();
/**
 * $ phonegap serve [options]
 *
 * Serves the app on a local web server.

 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 *     - `e` {Error} is null unless there was an error.
 */

module.exports = function(argv, callback) {
    // options
    var data = {
        port: argv.port || argv.p,
        autoreload: argv.autoreload,
        browser: argv.browser,
        console: argv.console,
        deploy: argv.deploy,
        homepage: argv.homepage,
        localtunnel: argv.localtunnel,
        proxy: !argv.proxy, // build commands expect default of false, but connect-phonegap expects default of true
        push: argv.push,
        refresh: argv.refresh,
        verbose: argv.verbose
    };
    var startWatchandServe = function() {
            startWatch(data, function() {});
        };

    if(argv.browser){

        addBrowser(startWatchandServe);
    } else {
        startWatch( data, callback);
    }
    

    // gracefully exit on ctrl-c
    process.on('SIGINT', function() {
        process.exit();
    });
};

function startWatch(data, callback) {
    // add gaze instance to data(options)
    var watches = [path.join(process.cwd(), 'www/**/*')];
    var watch = new gaze.Gaze(watches);
    data.watch = watch;

    //only do cordova prepare
    watch.on('all', function(filepath) {
        var options = {};
        options.cmd = 'cordova prepare';
        pg.cordova(options, function() {
        });
    });

    watch.on('ready', function(watcher){
        startServing(data, function(){});
    })
}

function startServing(data, callback) { 
    phonegap.serve(data, function(e, server) {
        if (!e) {
            console.log('');
            console.log('ctrl-c to stop the server');
            console.log('');
        }
        callback(e);
    });
}

function addBrowser(callback) {

    if (!fs.existsSync(path.join(process.cwd(), 'platforms/browser'))) {
        var options = {};
        options.cmd = 'cordova platform add browser';
        pg.cordova(options, callback);

    } else {
         callback();
    }

}

module.exports.addBrowser = addBrowser;

