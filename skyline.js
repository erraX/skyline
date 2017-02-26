/**
 * AMD loader
 *
 * @author niminjie(niminjiecide@gmail.com)
 */

(function (global) {

    'use strict';

    var toString = Object.prototype.toString;

    function isFunction(target) {
        return toString.call(target) === '[object Function]';
    }

    function isArray(target) {
        return toString.call(target) === '[object Array]';
    }

    function isString(target) {
        return toString.call(target) === '[object String]';
    }

    function exportAllValues() {
        var i;
        var module;

        for (i = newModules.length; i--;) {
            newModules[i].exportValue();
        }
    }

    /**
     * Cache modules
     *
     * @type {Object<string:Module>}
     */
    var cache = {};

    /**
     * New modules
     *
     * @type {Object<string:Module>}
     */
    var defQueue = [];

    /**
     * New modules
     *
     * @type {Object<string:Module>}
     */
    var newModules = [];

    /**
     *
     * Module
     *
     * @constructor
     */
    function Module(id, deps, factory) {
        this.id = id;
        this.deps = deps;
        this.factory = factory;

        this.loaded = false;
    }

    Module.prototype = {
        load: function () {
            // wait deps loaded
            if (this.deps && this.deps.length) {
                var depsValue = this.loadDeps();
            }

            // execute factory
            this.exportValue = this.factory.apply(global, depsValue);
        },

        loadScript: function (id) {
            // debugger
            var head = document.getElementsByTagName('head')[0];

            var script = document.createElement('script');
            script.type = 'text/javascript';

            // Only support `js`
            script.src = id + '.js';

            script.onload = function () {
                // debugger
                var module = defQueue.pop();

                if (!module.id) {
                    module.id = id;
                    cache[id] = module;
                    newModules.push(module);
                }

                exportAllValues();
            };

            head.appendChild(script);
        },

        loadDeps: function () {
            // debugger
            if (!this.deps || !this.deps.length) {
                return;
            }

            var i;

            for (i = 0; i < this.deps.length; i++) {
                var id = this.deps[i];

                // module is not loaded
                if (!cache.hasOwnProperty(id)) {
                    this.loadScript(id);
                }
            }
        },

        checkDeps: function () {
            var i;

            if (this.deps && this.deps.length) {
                for (i = 0; i < this.deps.length; i++) {
                    if (!cache[this.deps[i]] || !cache[this.deps[i]].load) {
                        return false;
                    }
                }
            }

            return true;
        },

        exportValue: function () {
            var i;
            var exportValue;
            var depValues = [];

            if (!this.checkDeps()) {
                return;
            }

            if (this.deps && this.deps.length) {
                for (i = 0; i < this.deps.length; i++) {
                    depValues.push(cache[this.deps[i]].exports);
                }
            }

            exportValue = this.factory.apply(global, depValues);

            this.exports = exportValue;
            this.load = true;
        }
    };

    /**
     * require
     *
     * @param {Array} id id
     * @param {function} factory factory
     *
     * @return {any}
     */
    function require(deps, factory) {
        if (isArray(deps) && isFunction(factory)) {

            // require deps and factory
            define('@main', deps, factory);
        }
        else if (isString(deps)) {
            // require a string
        }
    }

    /**
     * require.toUrl
     *
     * @param {string} path path
     *
     * @return {string}
     */
    require.toUrl = function (path) {
        return path;
    };

    /**
     * Define a module
     *
     * @param {string} id id
     * @param {Array<string>} deps deps
     * @param {function} factory factory
     *
     * @return {any}
     */
    function define(id, deps, factory) {
        var i;

        // Check params
        var args = [].slice.call(arguments);
        var argsLen = args.length;

        // last param: `factory` must be a function
        if (!isFunction(args[argsLen - 1])) {
            throw new Error('Module factory must be a function.');
        }

        // missing id, deps
        if (argsLen === 1) {
            factory = id;
            id = undefined;
            deps = undefined;
        }
        // missing id
        else if (argsLen === 2) {
            factory = deps;
            deps = id;
            id = undefined;
        }

        // debugger
        var module = new Module(id, deps, factory)
        defQueue.push(module);

        module.loadDeps();
    }

    define.amd = {
        version: '0.1beta'
    };

    var dataMain;

    (function executeMainScript() {
        var i;
        var scripts = document.getElementsByTagName('script');
        var head = document.getElementsByTagName('head')[0];

        for (i = 0; i < scripts.length; i++) {
            dataMain = scripts[i].getAttribute('data-main');

            if (dataMain) {
                // Main entry
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = dataMain;

                script.onload = function () {
                    var module = defQueue.pop();

                    if (!module.id) {
                        module.id = dataMain;
                        cache[dataMain] = module;
                        newModules.push(module);
                    }

                    exportAllValues();
                };

                head.appendChild(script);
                break;
            }
        }
    })();

    global.require = require;
    global.define = define;
})(this);
