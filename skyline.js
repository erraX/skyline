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

    /**
     * Cache modules
     *
     * @type {Object<string:Module>}
     */
    var cache = {};

    /**
     * Load modules
     *
     * @type {Object<string:Module>}
     */
    var modules = {};

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
            var head = document.getElementsByTagName('head')[0];

            var script = document.createElement('script');
            script.type = 'text/javascript';

            // Only support `js`
            script.src = id + '.js';

            script.onload = function () {
                // TODO: 
                //  1. new Module
                //  2. load depencencies

                // modules[id] = new Module(id, undefined, undefiend);
                // modules[id].load();
                console.log(modules);
            };

            head.appendChild(script);
        },

        loadDeps: function () {
            var i;

            for (i = 0; i < this.deps.length; i++) {
                var id = this.deps[i];

                // module is not loaded
                if (!cache.hasOwnProperty(id)) {
                    this.loadScript(id);
                }
            }
        },
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

        var module = new Module(id, deps, factory);
        module.load();

        modules[id] = module;

        return module;
    }

    define.amd = {
        version: '0.1beta'
    };

    global.require = require;
    global.define = define;

})(this);
