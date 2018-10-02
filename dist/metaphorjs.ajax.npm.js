
module.exports = function (window) {
/* BUNDLE START 2LX */
"use strict";

var undf = undefined;



/**
 * Transform anything into array
 * @function toArray
 * @param {*} list
 * @returns {array}
 */
function toArray(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};

/**
 * Convert anything to string
 * @function toString
 * @param {*} value
 * @returns {string}
 */
var toString = Object.prototype.toString;




var _varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /*
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */



    return function _varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num === 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



/**
 * Check if given value is plain object
 * @function isPlainObject
 * @param {*} value 
 * @returns {boolean}
 */
function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           _varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;
};

/**
 * Check if given value is a boolean value
 * @function isBool
 * @param {*} value 
 * @returns {boolean}
 */
function isBool(value) {
    return value === true || value === false;
};


/**
 * Copy properties from one object to another
 * @function extend
 * @param {Object} dst
 * @param {Object} src
 * @param {Object} src2 ... srcN
 * @param {boolean} override {
 *  Override already existing keys 
 *  @default false
 * }
 * @param {boolean} deep {
 *  Do not copy objects by link, deep copy by value
 *  @default false
 * }
 * @returns {object}
 */
function extend() {

    var override    = false,
        deep        = false,
        args        = toArray(arguments),
        dst         = args.shift(),
        src,
        k,
        value;

    if (isBool(args[args.length - 1])) {
        override    = args.pop();
    }
    if (isBool(args[args.length - 1])) {
        deep        = override;
        override    = args.pop();
    }

    while (src = args.shift()) {
        for (k in src) {

            if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                if (deep) {
                    if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                        extend(dst[k], value, override, deep);
                    }
                    else {
                        if (override === true || dst[k] == undf) { // == checks for null and undefined
                            if (isPlainObject(value)) {
                                dst[k] = {};
                                extend(dst[k], value, override, true);
                            }
                            else {
                                dst[k] = value;
                            }
                        }
                    }
                }
                else {
                    if (override === true || dst[k] == undf) {
                        dst[k] = value;
                    }
                }
            }
        }
    }

    return dst;
};


/**
 * Check if given value is a string
 * @function isString
 * @param {*} value 
 * @returns {boolean}
 */
function isString(value) {
    return typeof value === "string" || value === ""+value;
};


var MetaphorJs = {
    plugin: {},
    mixin: {},
    lib: {}
};




MetaphorJs.dom = MetaphorJs.dom || {};




var dom_getAttr = MetaphorJs.dom.getAttr = function(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};

var strUndef = "undefined";




var lib_Cache = MetaphorJs.lib.Cache = (function(){

    var globalCache;

    /**
     * @class MetaphorJs.lib.Cache
     */

    /**
     * @method
     * @constructor
     * @param {bool} cacheRewritable
     */
    var Cache = function(cacheRewritable) {

        var storage = {},

            finders = [];

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

            /**
             * Add finder function. If cache doesn't have an entry
             * with given name, it calls finder functions with this
             * name as a parameter. If one of the functions
             * returns anything else except undefined, it will
             * store this value and return every time given name
             * is requested.
             * @param {function} fn {
             *  @param {string} name
             *  @param {Cache} cache
             *  @returns {* | undefined}
             * }
             * @param {object} context
             * @param {bool} prepend Put in front of other finders
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
             * Add cache entry
             * @method
             * @param {string} name
             * @param {*} value
             * @param {bool} rewritable
             * @returns {*} value
             */
            add: function(name, value, rewritable) {

                if (storage[name] && storage[name].rewritable === false) {
                    return storage[name];
                }

                storage[name] = {
                    rewritable: typeof rewritable != strUndef ? rewritable : cacheRewritable,
                    value: value
                };

                return value;
            },

            /**
             * Get cache entry
             * @method
             * @param {string} name
             * @param {*} defaultValue {
             *  If value is not found, put this default value it its place
             * }
             * @returns {* | undefined}
             */
            get: function(name, defaultValue) {

                if (!storage[name]) {
                    if (finders.length) {

                        var i, l, res,
                            self = this;

                        for (i = 0, l = finders.length; i < l; i++) {

                            res = finders[i].fn.call(finders[i].context, name, self);

                            if (res !== undf) {
                                return self.add(name, res, true);
                            }
                        }
                    }

                    if (defaultValue !== undf) {
                        return this.add(name, defaultValue);
                    }

                    return undf; 
                }

                return storage[name].value;
            },

            /**
             * Remove cache entry
             * @method
             * @param {string} name
             * @returns {*}
             */
            remove: function(name) {
                var rec = storage[name];
                if (rec && rec.rewritable === true) {
                    delete storage[name];
                }
                return rec ? rec.value : undf;
            },

            /**
             * Check if cache entry exists
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * Walk cache entries
             * @method
             * @param {function} fn {
             *  @param {*} value
             *  @param {string} key
             * }
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * Clear cache
             * @method
             */
            clear: function() {
                storage = {};
            },

            /**
             * Clear and destroy cache
             * @method
             */
            $destroy: function() {

                var self = this;

                if (self === globalCache) {
                    globalCache = null;
                }

                storage = null;
                cacheRewritable = null;

                self.add = null;
                self.get = null;
                self.destroy = null;
                self.exists = null;
                self.remove = null;
            }
        };
    };

    /**
     * Get global cache
     * @method
     * @static
     * @returns {Cache}
     */
    Cache.global = function() {

        if (!globalCache) {
            globalCache = new Cache(true);
        }

        return globalCache;
    };

    return Cache;
    
}());





/**
 * Check if given value is an object (non-scalar)
 * @function isObject
 * @param {*} value 
 * @returns {boolean}
 */
function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = _varType(value);
    return vt > 2 || vt == -1;
};




/**
 * @class MetaphorJs.lib.Namespace
 * @code src-docs/examples/main.js
 */

/**
 * Construct namespace
 * @constructor
 * @param {object} root {
 *  Namespace root object. Everything you register
 *  will be assigned as property of root object at some level.
 *  The parameter is optional. Pass your own object or window or global
 *  to have direct access to its properties. 
 *  @optional
 * }
 */
var lib_Namespace = MetaphorJs.lib.Namespace = function(root) {

    root        = root || {};

    var self    = this,
        cache   = new lib_Cache(false);

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;

        if (cache[parent]) {
            return [cache[parent], last, ns];
        }

        if (len > 0) {
            for (i = 0; i < len; i++) {

                name    = tmp[i];

                if (current[name] === undf) {
                    current[name]   = {};
                }

                current = current[name];
            }
        }

        return [current, last, ns];
    };

    /**
     * Get namespace/cache object. 
     * @method
     * @param {string} objName Object name to get link to. Use the same name
     * as you used then registered or added the object.
     * @param {bool} cacheOnly Only get cached value. 
     * Return undefined if there is no cached value.
     * @returns {*}
     */
    var get       = function(objName, cacheOnly) {

        var ex = cache.get(objName);
        if (ex !== undf || cacheOnly) {
            return ex;
        }

        var tmp     = objName.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (current[name] === undf) {
                return undf;
            }

            current = current[name];
        }

        if (current) {
            cache.add(objName, current);
        }

        return current;
    };

    /**
     * Register item in namespace and cache. Given <code>root</code> is your
     * root object, registering <code>register("My.Value", 1)</code> will 
     * result in <code>root.My.Value === 1</code>.
     * @method
     * @param {string} objName Object name to register
     * @param {*} value
     * @returns {*} value
     */
    var register    = function(objName, value) {

        var parse   = parseNs(objName),
            parent  = parse[0],
            name    = parse[1];

        if (isObject(parent) && parent[name] === undf) {
            parent[name]        = value;
            cache.add(parse[2], value);
        }

        return value;
    };

    /**
     * Check if given object name exists in namespace.
     * @method
     * @param {string} objName
     * @returns {boolean}
     */
    var exists      = function(objName) {
        return get(ns, true) !== undf;
    };

    /**
     * Add item only to cache. This method will not add anything
     * to the root object. The <code>get</code> method will still return
     * value of this object.
     * @method
     * @param {string} objName
     * @param {*} value
     * @returns {*} value
     */
    var add = function(objName, value) {
        return cache.add(objName, value);
    };

    /**
     * Remove item from cache. Leaves namespace object unchanged.
     * @method
     * @param {string} objName
     * @returns {*} removed value
     */
    var remove = function(objName) {
        return cache.remove(objName);
    };

    /**
     * Make alias in the cache.
     * @method
     * @param {string} from
     * @param {string} to
     * @returns {*} value
     */
    var makeAlias = function(from, to) {

        var value = cache.get(from);

        if (value !== undf) {
            cache.add(to, value);
        }

        return value;
    };

    /**
     * Destroy namespace and all classes in it
     * @method $destroy
     */
    var destroy     = function() {

        var self = this,
            k;

        cache.eachEntry(function(entry){
            if (entry && entry.$destroy) {
                entry.$destroy();
            }
        });

        cache.$destroy();
        cache = null;

        for (k in self) {
            self[k] = null;
        }
    };

    self.register   = register;
    self.exists     = exists;
    self.get        = get;
    self.add        = add;
    self.remove     = remove;
    self.makeAlias  = makeAlias;
    self.$destroy    = destroy;
};


/**
 * Check if given value is a function
 * @function isFunction
 * @param {*} value 
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof value == 'function';
};



/**
 * Check if given value is array (not just array-like)
 * @function isArray
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value === "object" && _varType(value) === 5;
};


function emptyFn(){};



/**
 * Instantite class when you have a list of arguments
 * and you can't just use .apply()
 * @function instantiate
 * @param {function} fn Class constructor
 * @param {array} args Constructor arguments
 * @returns {object}
 */
function instantiate(fn, args) {

    var Temp = function(){},
        inst, ret;

    Temp.prototype  = fn.prototype;
    inst            = new Temp;
    ret             = fn.apply(inst, args);

    // If an object has been returned then return it otherwise
    // return the original instance.
    // (consistent with behaviour of the new operator)
    return isObject(ret) || ret === false ? ret : inst;
};

/**
 * Function interceptor
 * @function intercept
 * @param {function} origFn Original function
 * @param {function} interceptor Function that should execute instead(ish)
 * @param {object|null} context Function's context
 * @param {object|null} origContext Original function's context
 * @param {string} when {
 *  before | after | instead
 *  @default before
 * }
 * @param {bool} replaceValue true to return interceptor's return value
 * instead of original
 * @returns {Function}
 */
function intercept(origFn, interceptor, context, origContext, when, replaceValue) {

    when = when || "before";

    return function() {

        var intrRes,
            origRes;

        if (when == "instead") {
            return interceptor.apply(context || origContext, arguments);
        }
        else if (when == "before") {
            intrRes = interceptor.apply(context || origContext, arguments);
            origRes = intrRes !== false ? origFn.apply(origContext || context, arguments) : null;
        }
        else {
            origRes = origFn.apply(origContext || context, arguments);
            intrRes = interceptor.apply(context || origContext, arguments);
        }

        return replaceValue ? intrRes : origRes;
    };
};




var classManagerFactory = function(){


    var proto   = "prototype",
        constr  = "$constructor",

        $constr = function $constr() {
            var self = this;
            if (self.$super && self.$super !== emptyFn) {
                self.$super.apply(self, arguments);
            }
        },

        wrapPrototypeMethod = function wrapPrototypeMethod(parent, k, fn) {

            var $super = parent[proto][k] ||
                        (k === constr ? parent : emptyFn) ||
                        emptyFn;

            return function() {
                var ret,
                    self    = this,
                    prev    = self.$super;

                if (self.$destroyed) {
                    self.$super = null;
                    return null;
                }

                self.$super     = $super;
                ret             = fn.apply(self, arguments);
                self.$super     = prev;

                return ret;
            };
        },

        preparePrototype = function preparePrototype(prototype, cls, parent, onlyWrap) {
            var k, ck, pk, pp = parent[proto];

            for (k in cls) {
                if (cls.hasOwnProperty(k)) {
                    
                    pk = pp[k];
                    ck = cls[k];

                    prototype[k] = isFunction(ck) && (!pk || isFunction(pk)) ?
                                    wrapPrototypeMethod(parent, k, ck) :
                                    ck;
                }
            }

            if (onlyWrap) {
                return;
            }

            prototype.$plugins      = null;
            prototype.$pluginMap    = null;

            if (pp.$beforeInit) {
                prototype.$beforeInit = pp.$beforeInit.slice();
                prototype.$afterInit = pp.$afterInit.slice();
                prototype.$beforeDestroy = pp.$beforeDestroy.slice();
                prototype.$afterDestroy = pp.$afterDestroy.slice();
            }
            else {
                prototype.$beforeInit = [];
                prototype.$afterInit = [];
                prototype.$beforeDestroy = [];
                prototype.$afterDestroy = [];
            }
        },
        
        mixinToPrototype = function(prototype, mixin) {
            
            var k;
            for (k in mixin) {
                if (mixin.hasOwnProperty(k)) {
                    if (k === "$beforeInit") {
                        prototype.$beforeInit.push(mixin[k]);
                    }
                    else if (k === "$afterInit") {
                        prototype.$afterInit.push(mixin[k]);
                    }
                    else if (k === "$beforeDestroy") {
                        prototype.$beforeDestroy.push(mixin[k]);
                    }
                    else if (k === "$afterDestroy") {
                        prototype.$afterDestroy.push(mixin[k]);
                    }
                    else if (!prototype[k]) {
                        prototype[k] = mixin[k];
                    }
                }
            }
        };


    /**
     * Instantiate class system with namespace.
     * @group api
     * @function
     * @param {lib_Namespace} ns {
     *  Provide your own namespace or a new private ns will be 
     *  constructed automatically. 
     *  @optional
     * }
     * @returns {object} Returns cls() function/object. 
     */
    var classManagerFactory = function(ns) {

        if (!ns) {
            ns = new lib_Namespace;
        }

        var createConstructor = function(className) {

            return function() {

                var self    = this,
                    before  = [],
                    after   = [],
                    args    = arguments,
                    newArgs,
                    i, l,
                    plugins, plugin,
                    pmap,
                    plCls;

                if (!self) {
                    throw new Error("Must instantiate via new: " + className);
                }

                self.$plugins   = [];

                newArgs = self[constr].apply(self, arguments);

                if (newArgs && isArray(newArgs)) {
                    args = newArgs;
                }

                plugins = self.$plugins;
                pmap    = self.$pluginMap = {};

                for (i = -1, l = self.$beforeInit.length; ++i < l;
                     before.push([self.$beforeInit[i], self])) {}

                for (i = -1, l = self.$afterInit.length; ++i < l;
                     after.push([self.$afterInit[i], self])) {}

                if (plugins && plugins.length) {

                    for (i = 0, l = plugins.length; i < l; i++) {

                        plugin = plugins[i];

                        if (isString(plugin)) {
                            plCls = plugin;
                            plugin = ns ? ns.get(plugin, true) : null;
                            if (!plugin) {
                                throw plCls + " not found";
                            }
                        }
 
                        plugin = new plugin(self, args);
                        pmap[plugin.$class] = plugin;

                        if (plugin.$beforeHostInit) {
                            before.push([plugin.$beforeHostInit, plugin]);
                        }
                        if (plugin.$afterHostInit) {
                            after.push([plugin.$afterHostInit, plugin]);
                        }

                        plugins[i] = plugin;
                    }
                }

                for (i = -1, l = before.length; ++i < l;
                     before[i][0].apply(before[i][1], args)){}

                if (self.$init) {
                    self.$init.apply(self, args);
                }

                for (i = -1, l = after.length; ++i < l;
                     after[i][0].apply(after[i][1], args)){}

            };
        };


        /**
         * All classes defined with <code>cls</code> extend this class.
         * Basically,<code>cls({});</code> is the same as 
         * <code>BaseClass.$extend({})</code>.
         * @group api
         * @class BaseClass
         */
        var BaseClass = function() {

        };

        extend(BaseClass.prototype, {

            /**
             * Class name
             * @property {string} 
             */
            $class: null,
            $extends: null,

            /**
             * List of plugin names or constructors before class 
             * is initialised, list of plugin instances after initialisation
             * @property {array} 
             */
            $plugins: null,
            $pluginMap: null,
            $mixins: null,

            $destroyed: false,
            $destroying: false,

            $constructor: emptyFn,
            $init: emptyFn,
            $beforeInit: [],
            $afterInit: [],
            $beforeDestroy: [],
            $afterDestroy: [],

            /**
             * Get this instance's class name
             * @method
             * @returns {string}
             */
            $getClass: function() {
                return this.$class;
            },

            /**
             * Is this object instance of <code>cls</code>
             * @param {string} cls
             * @returns {boolean}
             */
            $is: function(cls) {
                return isInstanceOf(this, cls);
            },

            /**
             * Get parent class name
             * @method
             * @returns {string | null}
             */
            $getParentClass: function() {
                return this.$extends;
            },

            /**
             * Intercept method
             * @method
             * @param {string} method Intercepted method name
             * @param {function} fn function to call before or after intercepted method
             * @param {object} newContext optional interceptor's "this" object
             * @param {string} when optional, when to call interceptor 
             *                         before | after | instead; default "before"
             * @param {bool} replaceValue optional, return interceptor's return value 
             *                  or original method's; default false
             * @returns {function} original method
             */
            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this,
                    orig = self[method];
                self[method] = intercept(orig || emptyFn, fn, newContext || self, 
                                            self, when, replaceValue);
                return orig || emptyFn;
            },

            /**
             * Implement new methods or properties on instance
             * @method
             * @param {object} methods
             */
            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent, true);
                }
            },

            /**
             * Does this instance have a plugin
             * @method
             * @param cls
             * @returns {boolean}
             */
            $hasPlugin: function(cls) {
                return cls ? !!this.$pluginMap[cls] : false;
            },

            /**
             * Get plugin instance
             * @method
             * @param {string} cls Plugin class name
             * @returns {object|null}
             */
            $getPlugin: function(cls) {
                return cls ? this.$pluginMap[cls] || null : null;
            },

            /**
             * Get a bound to this object function
             * @method
             * @param {function} fn
             * @returns {Function}
             */
            $bind: function(fn) {
                var self = this;
                return function() {
                    if (!self.$isDestroyed()) {
                        return fn.apply(self, arguments);
                    }
                };
            },

            /**
             * Is this object destroyed
             * @method
             * @return {boolean}
             */
            $isDestroyed: function() {
                return self.$destroying || self.$destroyed;
            },

            /**
             * Destroy this instance. Also destroys plugins and
             * calls all beforeDestroy and afterDestroy handlers.
             * Also calls onDestroy.<br>
             * Safe to call multiple times.
             * @method
             */
            $destroy: function() {

                var self    = this,
                    before  = self.$beforeDestroy,
                    after   = self.$afterDestroy,
                    plugins = self.$plugins,
                    i, l, res;

                if (self.$destroying || self.$destroyed) {
                    return;
                }

                self.$destroying = true;

                for (i = -1, l = before.length; ++i < l;
                     before[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    if (plugins[i].$beforeHostDestroy) {
                        plugins[i].$beforeHostDestroy.call(plugins[i], arguments);
                    }
                }

                res = self.onDestroy.apply(self, arguments);

                for (i = -1, l = after.length; ++i < l;
                     after[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    plugins[i].$destroy.apply(plugins[i], arguments);
                }

                if (res !== false) {
                    for (i in self) {
                        if (self.hasOwnProperty(i)) {
                            self[i] = null;
                        }
                    }
                }

                self.$destroying = false;
                self.$destroyed = true;
            },

            /**
             * Overridable method. Put your destructor here
             * @method
             */
            onDestroy: function(){}
        });

        BaseClass.$self = BaseClass;

        /**
         * Create an instance of current class. Same as <code>cls.factory(name)</code>
         * @method
         * @static
         * @code var myObj = My.Class.$instantiate(arg1, arg2, ...);
         * @returns {object} class instance
         */
        BaseClass.$instantiate = function() {

            var cls = this,
                args = arguments,
                cnt = args.length;

            // lets make it ugly, but without creating temprorary classes and leaks.
            // and fallback to normal instantiation.

            switch (cnt) {
                case 0:
                    return new cls;
                case 1:
                    return new cls(args[0]);
                case 2:
                    return new cls(args[0], args[1]);
                case 3:
                    return new cls(args[0], args[1], args[2]);
                case 4:
                    return new cls(args[0], args[1], args[2], args[3]);
                default:
                    return instantiate(cls, args);
            }
        };

        /**
         * Override class methods (on prototype level, not on instance level)
         * @method
         * @static
         * @param {object} methods
         */
        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        /**
         * Create new class extending current one
         * @static
         * @method
         * @param {object} definition
         * @param {object} statics
         * @returns {function}
         */
        BaseClass.$extend = function(definition, statics) {
            return defineClass(definition, statics, this);
        };

        /**
         * Destroy class (not the instance)
         * @method
         * @static
         */
        BaseClass.$destroy = function() {
            var self = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        };
        /**
         * @end-class
         */


        /**
         * Constructed class system. Also this is a function, same as 
         * <code>cls.define</code>
         * @group api
         * @object cls
         */

        /**
         * @property {function} define {
         *  @param {object} definition {
         *      @type {string} $class optional class name
         *      @type {string} $extends optional parent class
         *      @type {array} $mixins optional list of mixins
         *      @type {function} $constructor optional low-level constructor
         *      @type {function} $init optional constructor
         *      @type {function} onDestroy your own destroy function
         *  }
         *  @param {object} statics any statis properties or methods
         * }
         * @code var Name = cls({$class: "Name"});
         */
        var defineClass = function defineClass(definition, statics, $extends) {

            definition          = definition || {};
            
            var name            = definition.$class,
                parentClass     = $extends || definition.$extends,
                mixins          = definition.$mixins,
                alias           = definition.$alias,
                pConstructor,
                i, l, k, prototype, c, mixin;

            if (parentClass) {
                if (isString(parentClass)) {
                    pConstructor = ns.get(parentClass);
                }
                else {
                    pConstructor = parentClass;
                    parentClass = pConstructor.$class || "";
                }
            }
            else {
                pConstructor = BaseClass;
                parentClass = "";
            }

            if (parentClass && !pConstructor) {
                throw parentClass + " not found";
            }

            definition.$class   = name;
            definition.$extends = parentClass;
            definition.$mixins  = null;

            prototype           = Object.create(pConstructor[proto]);
            definition[constr]  = definition[constr] || $constr;

            preparePrototype(prototype, definition, pConstructor);

            if (mixins) {
                for (i = 0, l = mixins.length; i < l; i++) {
                    mixin = mixins[i];
                    if (isString(mixin)) {
                        if (!ns) {
                            throw new Error("Mixin " + mixin + " not found");
                        }
                        mixin = ns.get(mixin, true);
                    }
                    mixinToPrototype(prototype, mixin);
                }
            }

            c = createConstructor(name);
            prototype.constructor = c;
            prototype.$self = c;
            c[proto] = prototype;

            for (k in BaseClass) {
                if (k !== proto && BaseClass.hasOwnProperty(k)) {
                    c[k] = BaseClass[k];
                }
            }

            for (k in pConstructor) {
                if (k !== proto && pConstructor.hasOwnProperty(k)) {
                    c[k] = pConstructor[k];
                }
            }

            if (statics) {
                for (k in statics) {
                    if (k !== proto && statics.hasOwnProperty(k)) {
                        c[k] = statics[k];
                    }
                }
            }

            c.$parent   = pConstructor;
            c.$self     = c;

            if (ns) {
                if (name) {
                    ns.register(name, c);
                }
                if (alias) {
                    ns.register(alias, c);
                }
            }

            return c;
        };




        /**
         * Instantiate class. Pass constructor parameters after "name"
         * @property {function} factory {
         * @code cls.factory("My.Class.Name", arg1, arg2, ...);
         * @param {string} name Full name of the class
         * @returns {object} class instance
         * }
         */
        var factory = function(name) {

            var cls     = ns ? ns.get(name) : null,
                args    = toArray(arguments).slice(1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is given object instance of class
         * @property {function} isInstanceOf {
         * @code cls.instanceOf(myObj, "My.Class");
         * @code cls.instanceOf(myObj, My.Class);
         * @param {object} cmp
         * @param {string|object} name
         * @returns {boolean}
         * }
         */
        var isInstanceOf = function(cmp, name) {
            var _cls    = isString(name) && ns ? ns.get(name) : name;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @property {function} isSubclassOf {
         * @code cls.isSubclassOf("My.Subclass", "My.Class");
         * @code cls.isSubclassOf(myObj, "My.Class");
         * @code cls.isSubclassOf("My.Subclass", My.Class);
         * @code cls.isSubclassOf(myObj, My.Class);
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return {boolean}
         * }
         */
        var isSubclassOf = function(childClass, parentClass) {

            var p   = childClass,
                g   = ns ? ns.get : function(){};

            if (!isString(parentClass)) {
                parentClass  = parentClass.prototype.$class;
            }

            if (isString(childClass)) {
                p   = g(childClass);
            }

            while (p && p.prototype) {

                if (p.prototype.$class === parentClass) {
                    return true;
                }

                p = p.$parent;
            }

            return false;
        };


        /**
         * Reference to the managerFactory
         * @property {function} classManagerFactory
         */
        defineClass.classManagerFactory = classManagerFactory;
        defineClass.factory = factory;
        defineClass.isSubclassOf = isSubclassOf;
        defineClass.isInstanceOf = isInstanceOf;
        defineClass.define = defineClass;

        /**
         * @property {function} Namespace Namespace constructor
         */
        defineClass.Namespace = lib_Namespace;

        /**
         * @property {class} BaseClass
         */
        defineClass.BaseClass = BaseClass;

        /**
         * @property {object} ns Namespace instance
         */
        defineClass.ns = ns;

        /**
         * @property {function} $destroy Destroy class system and namespace
         */
        defineClass.$destroy = function() {
            BaseClass.$destroy();
            BaseClass = null;
            if (ns) {
                ns.$destroy();
                ns = null;
            }
        };

        return defineClass;
    };

    return classManagerFactory;
}();




/**
 * Already constructed private namespace 
 * with <code>MetaphorJs</code> object and its alias <code>mjs</code> 
 * registered at top level.
 * @var ns 
 */
var ns = (function(){
    var ns = new lib_Namespace;
    ns.register("MetaphorJs", MetaphorJs);
    ns.register("mjs", MetaphorJs);
    return ns;
}());




var cls = classManagerFactory(ns);


/**
 * Bind function to context (Function.bind wrapper)
 * @function bind
 * @param {Function} fn
 * @param {*} context
 */
function bind(fn, context){
    return fn.bind(context);
};
/**
 * Execute <code>fn</code> asynchronously
 * @function async
 * @param {Function} fn Function to execute
 * @param {Object} context Function's context (this)
 * @param {[]} args Arguments to pass to fn
 * @param {number} timeout Execute after timeout (number of ms)
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};



/**
 * Log thrown error to console (in debug mode) and 
 * call all error listeners
 * @function error
 * @param {Error} e 
 */
var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            listeners[i][0].call(listeners[i][1], e)
        }

        /*DEBUG-START*/
        if (typeof console != strUndef && console.error) {
            console.error(e);
        }
        /*DEBUG-END*/
    };

    /**
     * Subscribe to all errors
     * @method on
     * @param {function} fn 
     * @param {object} context 
     */
    error.on = function(fn, context) {
        error.un(fn, context);
        listeners.push([fn, context]);
    };

    /**
     * Unsubscribe from all errors
     * @method un
     * @param {function} fn 
     * @param {object} context 
     */
    error.un = function(fn, context) {
        var i, l;
        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0] === fn && listeners[i][1] === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    return error;
}());





/**
 * Transform xml into a document
 * @function parseXML
 * @param {string} data 
 * @param {string} type 
 * @returns {Document}
 */
function parseXML(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } 
    catch (thrownError) {
        error(thrownError);
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw new Error("Invalid XML: " + data);
    }

    return xml;
};
var nextUid = (function(){

var uid = ['0', '0', '0'];

// from AngularJs
/**
 * Generates new alphanumeric id with starting 
 * length of 3 characters. IDs are consequential.
 * @function nextUid
 * @returns {string}
 */
function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
};

return nextUid;
}());






/**
 * Modified version of YASS (http://yass.webo.in)
 */

/**
 * Returns array of nodes or an empty array
 * @function MetaphorJs.dom.select
 * @param {string} selector
 * @param {Element} root to look into
 */
var dom_select = MetaphorJs.dom.select = function() {

    var rGeneric    = /^[\w[:#.][\w\]*^|=!]*$/,
        rQuote      = /=([^\]]+)/,
        rGrpSplit   = / *, */,
        rRepPlus    = /(\([^)]*)\+/,
        rRepTild    = /(\[[^\]]+)~/,
        rRepAll     = /(~|>|\+)/,
        rSplitPlus  = / +/,
        rSingleMatch= /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?::([^(]+)(?:\(([^)]+)\))?)?/,
        rNthNum     = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/,
        rNonDig     = /\D/,
        rRepPrnth   = /[^(]*\(([^)]*)\)/,
        rRepAftPrn  = /\(.*/,
        rGetSquare  = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/,

        doc         = window.document,
        bcn         = !!doc.getElementsByClassName,
        qsa         = !!doc.querySelectorAll,

        /*
         function calls for CSS2/3 modificatos. Specification taken from
         http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
         on success return negative result.
         */
        mods        = {
            /* W3C: "an E element, first child of its parent" */
            'first-child': function (child) {
                /* implementation was taken from jQuery.1.2.6, line 1394 */
                return child.parentNode.getElementsByTagName('*')[0] !== child;
            },
            /* W3C: "an E element, last child of its parent" */
            'last-child': function (child) {
                var brother = child;
                /* loop in lastChilds while nodeType isn't element */
                while ((brother = brother.nextSibling) && brother.nodeType !== 1) {}
                /* Check for node's existence */
                return !!brother;
            },
            /* W3C: "an E element, root of the document" */
            root: function (child) {
                return child.nodeName.toLowerCase() !== 'html';
            },
            /* W3C: "an E element, the n-th child of its parent" */
            'nth-child': function (child, ind) {
                var i = child.nodeIndex || 0,
                    a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                /* check if we have already looked into siblings, using exando - very bad */
                if (i) {
                    return !( (i + a) % b);
                } else {
                    /* in the other case just reverse logic for n and loop siblings */
                    var brother = child.parentNode.firstChild;
                    i++;
                    /* looping in child to find if nth expression is correct */
                    do {
                        /* nodeIndex expando used from Peppy / Sizzle/ jQuery */
                        if (brother.nodeType === 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.nextSibling);
                    return 1;
                }
            },
            /*
             W3C: "an E element, the n-th child of its parent,
             counting from the last one"
             */
            'nth-last-child': function (child, ind) {
                /* almost the same as the previous one */
                var i = child.nodeIndexLast || 0,
                    a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                if (i) {
                    return !( (i + a) % b);
                } else {
                    var brother = child.parentNode.lastChild;
                    i++;
                    do {
                        if (brother.nodeType === 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.previousSibling);
                    return 1;
                }
            },
            /*
             Rrom w3.org: "an E element that has no children (including text nodes)".
             Thx to John, from Sizzle, 2008-12-05, line 416
             */
            empty: function (child) {
                return !!child.firstChild;
            },
            /* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
            parent: function (child) {
                return !child.firstChild;
            },
            /* W3C: "an E element, only child of its parent" */
            'only-child': function (child) {
                return child.parentNode.getElementsByTagName('*').length !== 1;
            },
            /*
             W3C: "a user interface element E which is checked
             (for instance a radio-button or checkbox)"
             */
            checked: function (child) {
                return !child.checked;
            },
            /*
             W3C: "an element of type E in language "fr"
             (the document language specifies how language is determined)"
             */
            lang: function (child, ind) {
                return child.lang !== ind && doc.documentElement.lang !== ind;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 398 */
            enabled: function (child) {
                return child.disabled || child.type === 'hidden';
            },
            /* thx to John, from Sizzle, 2008-12-05, line 401 */
            disabled: function (child) {
                return !child.disabled;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 407 */
            selected: function(elem){
                /*
                 Accessing this property makes selected-by-default
                 options in Safari work properly.
                 */
                var tmp = elem.parentNode.selectedIndex;
                return !elem.selected;
            }
        },

        attrRegCache = {},

        getAttrReg  = function(value) {
            return attrRegCache[value] || (attrRegCache[value] = new RegExp('(^| +)' + value + '($| +)'));
        },

        attrMods    = {
            /* W3C "an E element with a "attr" attribute" */
            '': function (child, name) {
                return dom_getAttr(child, name) !== null;
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name)) && attrValue === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name)) && getAttrReg(value).test(attrValue);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') && !attrValue.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') &&
                       attrValue.indexOf(value) === attrValue.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') && attrValue.indexOf(value) !== -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') &&
                       (attrValue === value || !!attrValue.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, name, value) {
                var attrValue;
                return !(attrValue = dom_getAttr(child, name)) || !getAttrReg(value).test(attrValue);
            }
        };


    return function(selector, root) {

        /* clean root with document */
        root = root || doc;

        /* sets of nodes, to handle comma-separated selectors */
        var sets    = [],
            qsaErr  = null,
            idx, cls, nodes,
            i, node, ind, mod,
            attrs, attrName, eql, value;

        if (qsa && root.querySelectorAll) {
            /* replace not quoted args with quoted one -- Safari doesn't understand either */
            try {
                sets = toArray(root.querySelectorAll(selector.replace(rQuote, '="$1"')));
            }
            catch (thrownError) {
                error(thrownError);
                qsaErr = true;
            }
        }

        if (!qsa || qsaErr) {

            /* quick return or generic call, missed ~ in attributes selector */
            if (rGeneric.test(selector)) {

                /*
                 some simple cases - only ID or only CLASS for the very first occurence
                 - don't need additional checks. Switch works as a hash.
                 */
                idx = 0;

                /* the only call -- no cache, thx to GreLI */
                switch (selector.charAt(0)) {

                    case '#':
                        idx = selector.slice(1);
                        sets = doc.getElementById(idx);

                        /*
                         workaround with IE bug about returning element by name not by ID.
                         Solution completely changed, thx to deerua.
                         Get all matching elements with this id
                         */
                        if (sets.id !== idx) {
                            sets = doc.all[idx];
                        }

                        sets = sets ? [sets] : [];
                        break;

                    case '.':

                        cls = selector.slice(1);

                        if (bcn) {

                            sets = toArray((idx = (sets = root.getElementsByClassName(cls)).length) ? sets : []);

                        } else {

                            /* no RegExp, thx to DenVdmj */
                            cls = ' ' + cls + ' ';

                            nodes = root.getElementsByTagName('*');
                            i = 0;

                            while (node = nodes[i++]) {
                                if ((' ' + node.className + ' ').indexOf(cls) !== -1) {
                                    sets[idx++] = node;
                                }

                            }
                            sets = idx ? sets : [];
                        }
                        break;

                    case ':':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        ind     = selector.replace(rRepPrnth,"$1");
                        mod     = selector.replace(rRepAftPrn,'');

                        while (node = nodes[i++]) {
                            if (mods[mod] && !mods[mod](node, ind)) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    case '[':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        attrs   = rGetSquare.exec(selector);
                        attrName    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attrName, value) ||
                                                  (attrName === 'class' && attrMods[eql](node, 'className', value)))) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    default:
                        sets = toArray((idx = (sets = root.getElementsByTagName(selector)).length) ? sets : []);
                        break;
                }

            } else {

                /* number of groups to merge or not result arrays */
                /*
                 groups of selectors separated by commas.
                 Split by RegExp, thx to tenshi.
                 */
                var groups  = selector.split(rGrpSplit),
                    gl      = groups.length - 1, /* group counter */
                    concat  = !!gl, /* if we need to concat several groups */
                    group,
                    singles,
                    singles_length,
                    single, /* to handle RegExp for single selector */
                    ancestor, /* to remember ancestor call for next childs, default is " " */
                /* for inner looping */
                    tag, id, klass, newNodes, J, child, last, childs, item, h;

                /* loop in groups, maybe the fastest way */
                while (group = groups[gl--]) {

                    /*
                     Split selectors by space - to form single group tag-id-class,
                     or to get heredity operator. Replace + in child modificators
                     to % to avoid collisions. Additional replace is required for IE.
                     Replace ~ in attributes to & to avoid collisions.
                     */
                    singles_length = (singles = group
                        .replace(rRepPlus,"$1%")
                        .replace(rRepTild,"$1&")
                        .replace(rRepAll," $1 ").split(rSplitPlus)).length;

                    i = 0;
                    ancestor = ' ';
                    /* is cleanded up with DOM root */
                    if (root instanceof DocumentFragment) {
                        nodes = root.children;
                    }
                    else {
                        nodes = [root];
                    }

                    /*
                     John's Resig fast replace works a bit slower than
                     simple exec. Thx to GreLI for 'greed' RegExp
                     */
                    while (single = singles[i++]) {

                        /* simple comparison is faster than hash */
                        if (single !== ' ' && single !== '>' &&
                            single !== '~' && single !== '+' && nodes) {

                            single = single.match(rSingleMatch);

                            /*
                             Get all required matches from exec:
                             tag, id, class, attribute, value, modificator, index.
                             */
                            tag     = single[1] || '*';
                            id      = single[2];
                            klass   = single[3] ? ' ' + single[3] + ' ' : '';
                            attrName    = single[4];
                            eql     = single[5] || '';
                            mod     = single[7];

                            /*
                             for nth-childs modificator already transformed into array.
                             Example used from Sizzle, rev. 2008-12-05, line 362.
                             */
                            ind = mod === 'nth-child' ||
                                    mod === 'nth-last-child' ?
                                  rNthNum.exec(
                                      single[8] === 'even' && '2n' ||
                                      single[8] === 'odd' && '2n%1' ||
                                      !rNonDig.test(single[8]) && '0n%' + single[8] ||
                                      single[8]
                                  ) :
                                  single[8];

                            /* new nodes array */
                            newNodes = [];

                            /*
                             cached length of new nodes array
                             and length of root nodes
                             */
                            idx = J = 0;

                            /* if we need to mark node with expando yeasss */
                            last = i === singles_length;

                            /* loop in all root nodes */
                            while (child = nodes[J++]) {
                                /*
                                 find all TAGs or just return all possible neibours.
                                 Find correct 'children' for given node. They can be
                                 direct childs, neighbours or something else.
                                 */
                                switch (ancestor) {
                                    case ' ':
                                        if (child.getElementsByTagName) {
                                            childs = child.getElementsByTagName(tag);
                                            h = 0;
                                            while (item = childs[h++]) {
                                                /*
                                                check them for ID or Class. Also check for expando 'yeasss'
                                                to filter non-selected elements. Typeof 'string' not added -
                                                if we get element with name="id" it won't be equal to given ID string.
                                                Also check for given attributes selector.
                                                Modificator is either not set in the selector, or just has been nulled
                                                by modificator functions hash.
                                                */
                                                if ((!id || item.id === id) &&
                                                    (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                    (!attrName || (attrMods[eql] &&
                                                            (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                attrMods[eql](item, 'className', single[6]))))) &&
                                                    !item.yeasss && !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                    /*
                                                    Need to define expando property to true for the last step.
                                                    Then mark selected element with expando
                                                    */
                                                    if (last) {
                                                        item.yeasss = 1;
                                                    }
                                                    newNodes[idx++] = item;
                                                }
                                            }
                                        }
                                        break;
                                    /* W3C: "an F element preceded by an E element" */
                                    case '~':

                                        tag = tag.toLowerCase();

                                        /* don't touch already selected elements */
                                        while ((child = child.nextSibling) && !child.yeasss) {
                                            if (child.nodeType === 1 &&
                                                (tag === '*' || child.nodeName.toLowerCase() === tag) &&
                                                (!id || child.id === id) &&
                                                (!klass || (' ' + child.className + ' ').indexOf(klass) !== -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !child.yeasss &&
                                                !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                                if (last) {
                                                    child.yeasss = 1;
                                                }
                                                newNodes[idx++] = child;
                                            }
                                        }
                                        break;

                                    /* W3C: "an F element immediately preceded by an E element" */
                                    case '+':
                                        while ((child = child.nextSibling) && child.nodeType !== 1) {}
                                        if (child &&
                                            (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                                            (!id || child.id === id) &&
                                            (!klass || (' ' + item.className + ' ').indexOf(klass) !== -1) &&
                                            (!attrName ||
                                             (attrMods[eql] && (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                 attrMods[eql](item, 'className', single[6]))))) &&
                                            !child.yeasss && !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                            if (last) {
                                                child.yeasss = 1;
                                            }
                                            newNodes[idx++] = child;
                                        }
                                        break;

                                    /* W3C: "an F element child of an E element" */
                                    case '>':
                                        if (child.getElementsByTagName) {
                                            childs = child.getElementsByTagName(tag);
                                            i = 0;
                                            while (item = childs[i++]) {
                                                if (item.parentNode === child &&
                                                    (!id || item.id === id) &&
                                                    (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                    (!attrName || (attrMods[eql] &&
                                                            (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                attrMods[eql](item, 'className', single[6]))))) &&
                                                    !item.yeasss &&
                                                    !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                    if (last) {
                                                        item.yeasss = 1;
                                                    }
                                                    newNodes[idx++] = item;
                                                }
                                            }
                                        }
                                        break;
                                }
                            }

                            /* put selected nodes in local nodes' set */
                            nodes = newNodes;

                        } else {

                            /* switch ancestor ( , > , ~ , +) */
                            ancestor = single;
                        }
                    }

                    if (concat) {
                        /* if sets isn't an array - create new one */
                        if (!nodes.concat) {
                            newNodes = [];
                            h = 0;
                            while (item = nodes[h]) {
                                newNodes[h++] = item;
                            }
                            nodes = newNodes;
                            /* concat is faster than simple looping */
                        }
                        sets = nodes.concat(sets.length === 1 ? sets[0] : sets);

                    } else {

                        /* inialize sets with nodes */
                        sets = nodes;
                    }
                }

                /* define sets length to clean up expando */
                idx = sets.length;

                /*
                 Need this looping as far as we also have expando 'yeasss'
                 that must be nulled. Need this only to generic case
                 */
                while (idx--) {
                    sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
                }
            }
        }

        /* return and cache results */
        return sets;
    };
}();



/**
 * Checks if given value is a thenable (a Promise)
 * @function isThenable
 * @param {*} any
 * @returns {boolean|function}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
        return false;
    }
    
    var t;

    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }

    var then = any.then;

    return isFunction(then) ? then : false;
};




var lib_Promise = MetaphorJs.lib.Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,

        queue       = [],
        qRunning    = false,

        nextTick    = typeof process !== strUndef ?
                        process.nextTick :
                        function(fn) {
                            setTimeout(fn, 0);
                        },

        // synchronous queue of asynchronous functions:
        // callbacks must be called in "platform stack"
        // which means setTimeout/nextTick;
        // also, they must be called in a strict order.
        nextInQueue = function() {
            qRunning    = true;
            var next    = queue.shift();
            nextTick(function(){
                next[0].apply(next[1], next[2]);
                if (queue.length) {
                    nextInQueue();
                }
                else {
                    qRunning = false;
                }
            }, 0);
        },

        /**
         * add to execution queue
         * @function
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         * @ignore
         */
        next        = function(fn, scope, args) {
            args = args || [];
            queue.push([fn, scope, args]);
            if (!qRunning) {
                nextInQueue();
            }
        },

        /**
         * returns function which receives value from previous promise
         * and tries to resolve next promise with new value returned from given function(prev value)
         * or reject on error.
         * promise1.then(success, failure) -> promise2
         * wrapper(success, promise2) -> fn
         * fn(promise1 resolve value) -> new value
         * promise2.resolve(new value)
         *
         * @function
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         * @ignore
         */
        resolveWrapper     = function(fn, promise) {
            return function(value) {
                try {
                    promise.resolve(fn(value));
                }
                catch (thrownError) {
                    promise.reject(thrownError);
                }
            };
        };


    /**
     * @class MetaphorJs.lib.Promise
     */

    /**
     * @constructor 
     * @method Promise
     * @param {Function} fn {
     *  @description Constructor accepts two parameters: resolve and reject functions.
     *  @param {function} resolve {
     *      @param {*} value
     *  }
     *  @param {function} reject {
     *      @param {*} reason
     *  }
     * }
     * @param {Object} context
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {Thenable} thenable
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {*} value Value to resolve promise with
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @returns {Promise}
     */
    var Promise = function(fn, context) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, context);
        }

        var self = this,
            then;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (arguments.length > 0) {

            if (then = isThenable(fn)) {
                if (fn instanceof Promise) {
                    fn.then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
                else {
                    (new Promise(then, fn)).then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
            }
            else if (isFunction(fn)) {
                try {
                    fn.call(context,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (thrownError) {
                    self.reject(thrownError);
                }
            }
            else {
                self.resolve(fn);
            }
        }
    };

    extend(Promise.prototype, {

        _state: PENDING,

        _fulfills: null,
        _rejects: null,
        _dones: null,
        _fails: null,

        _wait: 0,

        _value: null,
        _reason: null,

        _triggered: false,

        /**
         * Is promise still pending (as opposed to resolved or rejected)
         * @method
         * @returns {boolean}
         */
        isPending: function() {
            return this._state === PENDING;
        },

        /**
         * Is the promise fulfilled. Same as isResolved()
         * @method
         * @returns {boolean}
         */
        isFulfilled: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise resolved. Same as isFulfilled()
         * @method
         * @returns {boolean}
         */
        isResolved: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise rejected
         * @method
         * @returns {boolean}
         */
        isRejected: function() {
            return this._state === REJECTED;
        },

        /**
         * Did someone subscribed to this promise
         * @method
         * @returns {boolean}
         */
        hasListeners: function() {
            var self = this,
                ls  = [self._fulfills, self._rejects, self._dones, self._fails],
                i, l;

            for (i = 0, l = ls.length; i < l; i++) {
                if (ls[i] && ls[i].length) {
                    return true;
                }
            }

            return false;
        },

        _cleanup: function() {
            var self    = this;

            self._fulfills = null;
            self._rejects = null;
            self._dones = null;
            self._fails = null;
        },

        _processValue: function(value, cb, allowThenanle) {

            var self    = this,
                then;

            if (self._state !== PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            if (allowThenanle) {
                try {
                    if (then = isThenable(value)) {
                        if (value instanceof Promise) {
                            value.then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        else {
                            (new Promise(then, value)).then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        return;
                    }
                }
                catch (thrownError) {
                    if (self._state === PENDING) {
                        self._doReject(thrownError);
                    }
                    return;
                }
            }

            cb.call(self, value);
        },


        _callResolveHandlers: function() {

            var self    = this;

            self._done();

            var cbs  = self._fulfills,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._value]);
            }

            self._cleanup();
        },


        _doResolve: function(value) {
            var self    = this;

            self._value = value;
            self._state = FULFILLED;

            if (self._wait === 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve, true);
        },

        /**
         * Resolve the promise
         * @method
         * @param {*} value
         */
        resolve: function(value) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;
            self._processResolveValue(value);

            return self;
        },


        _callRejectHandlers: function() {

            var self    = this;

            self._fail();

            var cbs  = self._rejects,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._reason]);
            }

            self._cleanup();
        },

        _doReject: function(reason) {

            var self        = this;

            self._state     = REJECTED;
            self._reason    = reason;

            if (self._wait === 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject, false);
        },

        /**
         * Reject the promise
         * @method
         * @param {*} reason
         */
        reject: function(reason) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;

            self._processRejectReason(reason);

            return self;
        },

        /**
         * @method
         * @async
         * @param {Function} resolve -- called when this promise is resolved; 
         *  returns new resolve value or promise
         * @param {Function} reject -- called when this promise is rejected; 
         *  returns new reject reason
         * @param {object} context -- resolve's and reject's functions "this" object
         * @returns {Promise} new promise
         */
        then: function(resolve, reject, context) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (context) {
                if (resolve) {
                    resolve = bind(resolve, context);
                }
                if (reject) {
                    reject = bind(reject, context);
                }
            }

            if (state === PENDING || self._wait !== 0) {

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([resolveWrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([resolveWrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state === FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(resolveWrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state === REJECTED) {
                if (reject && isFunction(reject)) {
                    next(resolveWrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * Add reject listener.
         * @method
         * @async
         * @param {Function} reject -- same as then(null, reject)
         * @returns {Promise} new promise
         */
        "catch": function(reject) {
            return this.then(null, reject);
        },

        _done: function() {

            var self    = this,
                cbs     = self._dones,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * Add resolve listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, context) {
            var self    = this,
                state   = self._state;

            if (state === FULFILLED && self._wait === 0) {
                try {
                    fn.call(context || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING) {
                self._dones.push([fn, context]);
            }

            return self;
        },

        _fail: function() {

            var self    = this,
                cbs     = self._fails,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * Add reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, context) {

            var self    = this,
                state   = self._state;

            if (state === REJECTED && self._wait === 0) {
                try {
                    fn.call(context || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING) {
                self._fails.push([fn, context]);
            }

            return self;
        },

        /**
         * Add both resolve and reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} context -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, context) {
            this.done(fn, context);
            this.fail(fn, context);
            return this;
        },

        /**
         * Get a thenable object
         * @method
         * @returns {object} then: function, done: function, fail: function, always: function
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self),
                "catch": bind(self['catch'], self)
            };
        },

        /**
         * Resolve this promise after <code>value</code> promise is resolved.
         * @method
         * @param {*|Promise} value
         * @returns {Promise} self
         */
        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait === 0 && self._state !== PENDING) {
                        self._state === FULFILLED ?
                            self._callResolveHandlers() :
                            self._callRejectHandlers();
                    }
                };

                if (isFunction(value.done)) {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        }
    }, true, false);


    /**
     * Call function <code>fn</code> with given args in given context
     * and use its return value as resolve value for a new promise.
     * Then return this promise.
     * @static
     * @method
     * @param {function} fn
     * @param {object} context
     * @param {[]} args
     * @returns {Promise}
     */
    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * Create new promise and resolve it with given value
     * @static
     * @method
     * @param {*} value
     * @returns {Promise}
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * Create new promise and reject it with given reason
     * @static
     * @method
     * @param {*} reason
     * @returns {Promise}
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * Take a list of promises or values and once all promises are resolved,
     * create a new promise and resolve it with a list of final values.<br>
     * If one of the promises is rejected, it will reject the returned promise.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.all = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = new Array(len),
            cnt     = len,
            i,
            item,
            done    = function(value, inx) {
                values[inx] = value;
                cnt--;

                if (cnt === 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {

            (function(inx){
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(function(value){
                        done(value, inx);
                    })
                        .fail(p.reject, p);
                }
                else if (isThenable(item) || isFunction(item)) {
                    (new Promise(item))
                        .done(function(value){
                            done(value, inx);
                        })
                        .fail(p.reject, p);
                }
                else {
                    done(item, inx);
                }
            })(i);
        }

        return p;
    };

    /**
     * Same as <code>all()</code> but it treats arguments as list of values.
     * @static
     * @method
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * Same as <code>all()</code> but the resulting promise
     * will not be rejected if ones of the passed promises is rejected.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.allResolved = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = [],
            cnt     = len,
            i,
            item,
            settle  = function(value) {
                values.push(value);
                proceed();
            },
            proceed = function() {
                cnt--;
                if (cnt === 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(settle).fail(proceed);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(settle).fail(proceed);
            }
            else {
                settle(item);
            }
        }

        return p;
    };

    /**
     * Given the list of promises or values it will return a new promise
     * and resolve it with the first resolved value.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.race = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p   = new Promise,
            len = promises.length,
            i,
            item;

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(p.resolve, p).fail(p.reject, p);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(p.resolve, p).fail(p.reject, p);
            }
            else {
                p.resolve(item);
            }

            if (!p.isPending()) {
                break;
            }
        }

        return p;
    };

    /**
     * Takes a list of async functions and executes 
     * them in given order consequentially
     * @static
     * @method
     * @param {[]} functions -- array of promises or resolve values or functions
     * @returns {Promise}
     */
    Promise.waterfall = function(functions) {

        if (!functions.length) {
            return Promise.resolve(null);
        }

        var first   = functions.shift(),
            promise = isFunction(first) ? Promise.fcall(first) : Promise.resolve(fn),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else if (isFunction(fn)) {
                promise = promise.then(fn);
            }
            else {
                promise.resolve(fn);
            }
        }

        return promise;
    };

    /**
     * Works like Array.forEach but it expects passed function to 
     * return a Promise.
     * @static
     * @method 
     * @param {array} items 
     * @param {function} fn {
     *  @param {*} value
     *  @param {int} index
     *  @returns {Promise|*}
     * }
     * @param {object} context 
     * @param {boolean} allResolved if true, the resulting promise
     * will fail if one of the returned promises fails.
     */
    Promise.forEach = function(items, fn, context, allResolved) {

        var left = items.slice(),
            p = new Promise,
            values = [],
            i = 0;

        var next = function() {

            if (!left.length) {
                p.resolve(values);
                return;
            }

            var item = left.shift(),
                index = i;

            i++;

            Promise.fcall(fn, context, [item, index])
                .done(function(result){
                    values.push(result);
                    next();
                })
                .fail(function(reason){
                    if (allResolved) {
                        p.reject(reason);
                    }
                    else {
                        values.push(null);
                        next();
                    }
                });
        };

        next();

        return p;
    };

    /**
     * Returns a promise with additional <code>countdown</code>
     * method. Call this method <code>cnt</code> times and
     * the promise will get resolved.
     * @static
     * @method
     * @param {int} cnt 
     * @returns {Promise}
     */
    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt === 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();






/**
 * @mixin MetaphorJs.mixin.Promise
 */
var mixin_Promise = MetaphorJs.mixin.Promise = {

    $$promise: null,

    $beforeInit: function() {
        this.$$promise = new lib_Promise;
    },

    /**
     * @method
     * @async
     * @param {Function} resolve -- called when this promise is resolved; 
     *  returns new resolve value or promise
     * @param {Function} reject -- called when this promise is rejected; 
     *  returns new reject reason
     * @param {object} context -- resolve's and reject's functions "this" object
     * @returns {Promise} new promise
     */
    then: function() {
        return this.$$promise.then.apply(this.$$promise, arguments);
    },

    /**
     * Add resolve listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is resolved
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    done: function() {
        this.$$promise.done.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add both resolve and reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise resolved or rejected
     * @param {Object} context -- function's "this" object
     * @return {Promise} same promise
     */
    always: function() {
        this.$$promise.always.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is rejected.
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    fail: function() {
        this.$$promise.fail.apply(this.$$promise, arguments);
        return this;
    }

};




var lib_ObservableEvent = MetaphorJs.lib.ObservableEvent = (function(){

/**
 * This class is private - you can't create an event other than via Observable.
 * See {@link class:Observable} reference.
 * @class MetaphorJs.lib.ObservableEvent
 * @private
 */
var ObservableEvent = function(name, options) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;

    if (typeof options === "object" && options !== null) {
        extend(self, options, true, false);
    }
    else {
        self.returnResult = options;
    }
};


extend(ObservableEvent.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
    returnResult: null,
    autoTrigger: null,
    lastTrigger: null,
    triggerFilter: null,
    filterContext: null,
    expectPromises: false,
    resolvePromises: false,

    /**
     * Get event name
     * @method
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    $destroy: function() {
        var self        = this,
            k;

        for (k in self) {
            self[k] = null;
        }
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self    = this,
            uni     = self.uni,
            id      = fn[uni] || ++self.lid,
            ctxUni  = uni + "_" + id,
            first   = options.first || false;

        if (fn[uni] && (!context || context[ctxUni]) && !options.allowDupes) {
            return null;
        }
        if (!fn[uni]) {
            fn[uni]  = id;
        }
        if (context && !context[ctxUni]) {
            context[ctxUni] = true;
        }

        var e = {
            fn:         fn,
            context:    context,
            id:         id,
            async:      false,
            called:     0, // how many times the function was triggered
            limit:      0, // how many times the function is allowed to trigger
            start:      1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     null, // append parameters
            prepend:    null // prepend parameters
        };

        extend(e, options, true, false);

        if (e.async === true) {
            e.async = 1;
        }

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id === id) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return id;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    once: function(fn, context, options) {

        options = options || {};
        options.limit = 1;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            id;

        if (fn == parseInt(fn)) {
            id      = parseInt(fn);
        }
        else {
            id      = fn[uni];
        }

        if (!id) {
            return false;
        }

        var ctxUni  = uni + "_" + id;
        context     = context || null;

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id === id && 
                listeners[i].context === context) {
                inx = i;
                delete fn[uni];
                if (context) {
                    delete context[ctxUni];
                }
                break;
            }
        }

        if (inx === -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[id];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     * @return boolean
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            if (!isFunction(fn)) {
                id  = parseInt(fn);
            }
            else {
                id  = fn[self.uni];
            }

            if (!id) {
                return false;
            }

            var ctxUni  = self.uni + "_" + id;

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id === id) {
                    if (!context || context[ctxUni]) {
                        return true;
                    }
                }
            }

            return false;
        }
        else {
            return listeners.length > 0;
        }
    },


    /**
     * @method
     */
    removeAllListeners: function() {
        var self    = this,
            listeners = self.listeners,
            uni     = self.uni,
            i, len, ctxUni;

        for (i = 0, len = listeners.length; i < len; i++) {
            ctxUni = uni +"_"+ listeners[i].fn[uni];
            delete listeners[i].fn[uni];
            if (listeners[i].context) {
                delete listeners[i].context[ctxUni];
            }
        }
        self.listeners   = [];
        self.map         = {};
    },

    /**
     * @method
     */
    suspend: function() {
        this.suspended = true;
    },

    /**
     * @method
     */
    resume: function() {
        this.suspended = false;
    },


    _prepareArgs: function(l, triggerArgs) {
        var args;

        if (l.append || l.prepend) {
            args    = triggerArgs.slice();
            if (l.prepend) {
                args    = l.prepend.concat(args);
            }
            if (l.append) {
                args    = args.concat(l.append);
            }
        }
        else {
            args = triggerArgs;
        }

        return args;
    },

    /**
     * @method
     * @return {*}
     */
    trigger: function() {

        var self            = this,
            listeners       = self.listeners,
            rr              = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            expectPromises  = self.expectPromises,
            keepPromiseOrder= self.keepPromiseOrder,
            results         = [],
            origArgs        = toArray(arguments),
            prevPromise,
            resPromise,
            args, 
            resolver;

        if (self.suspended) {
            return null;
        }

        if (self.autoTrigger) {
            self.lastTrigger = origArgs.slice();
        }

        if (listeners.length === 0) {
            return null;
        }

        var ret     = rr === "all" || rr === "concat" ?
                        [] : 
                        (rr === "merge" ? {} : null),
            q, l,
            res;

        if (rr === "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = listeners.slice();
        }

        if (expectPromises && rr === "last") {
            keepPromiseOrder = true;
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            args = self._prepareArgs(l, origArgs);

            if (filter && filter.call(filterContext, l, args, self) === false) {
                continue;
            }

            if (l.filter && l.filter.apply(l.filterContext || l.context, args) === false) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            if (l.async && !expectPromises) {
                res = null;
                async(l.fn, l.context, args, l.async);
            }
            else {
                if (expectPromises) {
                    resolver = function(l, rr, args){
                        return function(value) {

                            if (rr === "pipe") {
                                args[0] = value;
                                args = self._prepareArgs(l, args);
                            }
                            
                            return l.fn.apply(l.context, args);
                        }
                    }(l, rr, origArgs.slice());

                    if (prevPromise) {
                        res = prevPromise.then(resolver);
                    }
                    else {
                        res = l.fn.apply(l.context, args);
                    }

                    res.catch(error);
                }
                else {
                    res = l.fn.apply(l.context, args);
                }
            }

            l.called++;

            if (l.called === l.limit) {
                self.un(l.id);
            }

            // This rule is valid in all cases sync and async.
            // It either returns first value or first promise.
            if (rr === "first") {
                return res;
            }
        
            // Promise branch
            if (expectPromises) {
            
                // we collect all results for further processing/resolving
                results.push(res);

                if ((rr === "pipe" || keepPromiseOrder) && res) {
                    prevPromise = res;
                }
            }
            else {
                if (rr !== null) {
                    if (rr === "all") {
                        ret.push(res);
                    }
                    else if (rr === "concat" && res) {
                        ret = ret.concat(res);
                    }
                    else if (rr === "merge") {
                        extend(ret, res, true, false);
                    }
                    else if (rr === "nonempty" && res) {
                        return res;
                    }
                    else if (rr === "pipe") {
                        ret = res;
                        origArgs[0] = res;
                    }
                    else if (rr === "last") {
                        ret = res;
                    }
                    else if (rr === false && res === false) {
                        return false;
                    }
                    else if (rr === true && res === true) {
                        return true;
                    }
                }
            }
        }

        if (expectPromises) {
            if (rr === "pipe") {
                return prevPromise;
            }
            resPromise = Promise.all(results);
            if (self.resolvePromises && rr !== null && rr !== "all") {
                resPromise = resPromise.then(function(values){
                    var i, l = values.length, res;
                    for(i = 0; i < l; i++) {
                        res = values[i];
                        if (rr === "concat" && res) {
                            ret = ret.concat(res);
                        }
                        else if (rr === "merge") {
                            extend(ret, res, true, false);
                        }
                        else if (rr === "nonempty" && res) {
                            return res;
                        }
                        else if (rr === "last") {
                            ret = res;
                        }
                        else if (rr === false && res === false) {
                            return false;
                        }
                        else if (rr === true && res === true) {
                            return true;
                        }
                    }
                    return ret;
                });
            }
            return resPromise;
        }
        else return ret;
    }
}, true, false);

return ObservableEvent;
}());


    


var lib_Observable = MetaphorJs.lib.Observable = (function(){

/**
 * @description A javascript event system implementing multiple patterns: 
 * observable, collector and pipe.
 * @description Observable:
 * @code src-docs/examples/observable.js
 *
 * @description Collector:
 * @code src-docs/examples/collector.js
 * 
 * @description Pipe:
 * @code src-docs/examples/pipe.js
 *
 * @class MetaphorJs.lib.Observable
 * @author Ivan Kuindzhi
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {


    /**
     * @method createEvent
     * @param {string} name {
     *      Event name
     *      @required
     * }
     * @param {object|string|bool} options {
     *  Options object or returnResult value. All options are optional.
     * 
     *  @type {string|bool} returnResult {
     *   false -- return first 'false' result and stop calling listeners after that<br>
     *   true -- return first 'true' result and stop calling listeners after that<br>
     *   "all" -- return all results as array<br>
     *   "concat" -- merge all results into one array (each result must be array)<br>
     *   "merge" -- merge all results into one object (each result much be object)<br>
     *   "pipe" -- pass return value of previous listener to the next listener.
     *             Only first trigger parameter is being replaced with return value,
     *             others stay as is.<br>
     *   "first" -- return result of the first handler (next listener will not be called)<br>
     *   "nonempty" -- return first nonempty result<br>
     *   "last" -- return result of the last handler (all listeners will be called)<br>
     *  }
     *  @type {bool} autoTrigger {
     *      once triggered, all future subscribers will be automatically called
     *      with last trigger params
     *      @code src-docs/examples/autoTrigger.js
     * }
     *  @type {function} triggerFilter {
     *      This function will be called each time event is triggered. 
     *      Return false to skip listener.
     *       @code src-docs/examples/triggerFilter.js
     *       @param {object} listener This object contains all information about the listener, including
     *           all data you provided in options while subscribing to the event.
     *       @param {[]} arguments
     *       @return {bool}
     *  }
     *  @type {object} filterContext triggerFilter's context
     *  @type {bool} expectPromises {   
     *      Expect listeners to return Promises. If <code>returnResult</code> is set,
     *      promises will be treated as return values unless <code>resolvePromises</code>
     *      is set.
     *  }
     *  @type {bool} resolvePromises {
     *      In pair with <code>expectPromises</code> and <code>returnResult</code>
     *      this option makes trigger function wait for promises to resolve.
     *      All or just one depends on returnResult mode. "pipe" mode 
     *      makes promises resolve consequentially passing resolved value
     *      to the next promise.
     *  }
     * }
     * @returns {lib_ObservableEvent}
     */
    createEvent: function(name, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name, options);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {lib_ObservableEvent|undefined}
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @param {string} name {
    *       Event name. Use '*' to subscribe to all events.
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
    *       @type {bool} first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type {number} limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type {number} start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
        *      @type {[]} append Append parameters
        *      @type {[]} prepend Prepend parameters
        *      @type {bool} allowDupes allow the same handler twice
        *      @type {bool|int} async run event asynchronously. If event was
        *                      created with <code>expectPromises: true</code>, 
        *                      this option is ignored.
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link class:Observable.on}, but options.limit is forcefully set to 1.
    * @method
    * @access public
    */
    once: function(name, fn, context, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, context, options);
    },

    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} context If you called on() with context you must 
    *                         call un() with the same context
    */
    un: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    },

    /**
     * Relay all events of <code>eventSource</code> through this observable.
     * @method
     * @access public
     * @code src-docs/examples/relay.js
     * @param {object} eventSource
     * @param {string} eventName
     */
    relayEvent: function(eventSource, eventName) {
        eventSource.on(eventName, this.trigger, this, {
            prepend: eventName === "*" ? null : [eventName]
        });
    },

    /**
     * Stop relaying events of <code>eventSource</code>
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    unrelayEvent: function(eventSource, eventName) {
        eventSource.un(eventName, this.trigger, this);
    },

    /**
     * @method hasListener
     * @access public
     * @return bool
     */

    /**
    * @method hasListener
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {function} fn Callback function { @required }
    * @param {object} context Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, context) {
        var events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, context);
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */
    hasEvent: function(name) {
        return !!this.events[name];
    },


    /**
    * Remove all listeners from all events
    * @method removeAllListeners
    * @access public
    */

    /**
    * Remove all listeners from specific event
    * @method
    * @access public
    * @param {string} name Event name { @required }
    */
    removeAllListeners: function(name) {
        var events  = this.events;
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    },

    /**
    * Trigger an event -- call all listeners. Also triggers '*' event.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events,
            e,
            res = null;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            res = e.trigger.apply(e, toArray(arguments).slice(1));
        }

        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger.apply(e, arguments);
        }
        
        return res;
    },

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @method
    * @access public
    * @param {string} name Event name
    */
    suspendEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    },

    /**
    * @method
    * @access public
    */
    suspendAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].suspend();
        }
    },

    /**
    * Resume suspended event.
    * @method
    * @access public
    * @param {string} name Event name
    */
    resumeEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].resume();
    },

    /**
    * @method
    * @access public
    */
    resumeAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].resume();
        }
    },

    /**
     * @method
     * @access public
     * @param {string} name Event name
     */
    destroyEvent: function(name) {
        var events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].$destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    */
    $destroy: function() {
        var self    = this,
            events  = self.events;

        for (var i in events) {
            self.destroyEvent(i);
        }

        for (i in self) {
            self[i] = null;
        }
    },

    /**
    * Although all methods are public there is getApi() method that allows you
    * extending your own objects without overriding "destroy" (which you probably have)
    * @code src-docs/examples/api.js
    * @method
    * @md-not-inheritable
    * @returns object
    */
    getApi: function() {

        var self    = this;

        if (!self.api) {

            var methods = [
                    "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                    "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                    "resumeAllEvents", "destroyEvent",
                    "relayEvent", "unrelayEvent"
                ],
                api = {},
                name;

            for(var i =- 1, l = methods.length;
                    ++i < l;
                    name = methods[i],
                    api[name] = bind(self[name], self)){}

            self.api = api;
        }

        return self.api;

    }
}, true, false);

return Observable;
}());





var dom_setAttr = MetaphorJs.dom.setAttr = function(el, name, value) {
    return el.setAttribute(name, value);
};



MetaphorJs.ajax = MetaphorJs.ajax || {transport: {}};





// partly from jQuery serialize.js

var ajax_serializeParam = MetaphorJs.ajax.serializeParam = function(){

    var r20 = /%20/g,
        rbracket = /\[\]$/;

    function buildParams(prefix, obj, add) {
        var name,
            i, l, v;

        if (isArray(obj)) {
            // Serialize array item.

            for (i = 0, l = obj.length; i < l; i++) {
                v = obj[i];

                if (rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + "[" + ( typeof v === "object" ? i : "" ) + "]",
                        v,
                        add
                    );
                }
            }
        } else if (isPlainObject(obj)) {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[ name ], add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    return function(obj) {

        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                value = isFunction(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        for ( prefix in obj ) {
            buildParams(prefix, obj[prefix], add);
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };


}();




var ajax_transport_XHR = MetaphorJs.ajax.transport.XHR = (function(){

    var accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw new Error("Unable to create XHR object");
                    }
                }
            }

            return xhr;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && location && location.protocol === "file:")
                       || (r.status >= 200 && r.status < 300)
                       || r.status === 304 || r.status === 1223; // || r.status === 0;
            } 
            catch (thrownError) {
                error(thrownError);
            }
            return false;
        };

    return cls({

        type: "xhr",
        _xhr: null,
        _deferred: null,
        _ajax: null,

        $init: function(opt, deferred, ajax) {

            var self    = this,
                xhr;

            self._xhr = xhr     = createXHR();
            self._deferred      = deferred;
            self._opt           = opt;
            self._ajax          = ajax;

            if (opt.progress) {
                xhr.onprogress = bind(opt.progress, opt.context);
            }
            if (opt.uploadProgress && xhr.upload) {
                xhr.upload.onprogress = bind(opt.uploadProgress, opt.context);
            }

            xhr.onreadystatechange = bind(self.onReadyStateChange, self);
        },

        setHeaders: function() {

            var self = this,
                opt = self._opt,
                xhr = self._xhr,
                i;

            if (opt.xhrFields) {
                for (i in opt.xhrFields) {
                    xhr[i] = opt.xhrFields[i];
                }
            }
            if (opt.data && opt.contentType) {
                xhr.setRequestHeader("Content-Type", 
                    opt.contentTypeHeader || opt.contentType
                );
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept",
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default
            );
            for (i in opt.headers) {
                xhr.setRequestHeader(i, opt.headers[i]);
            }

        },

        onReadyStateChange: function() {

            var self        = this,
                xhr         = self._xhr,
                deferred    = self._deferred;

            if (xhr.readyState === 0) {
                xhr.onreadystatechange = emptyFn;
                deferred.resolve(xhr);
                return;
            }

            if (xhr.readyState === 4) {
                xhr.onreadystatechange = emptyFn;

                if (httpSuccess(xhr)) {

                    self._ajax.processResponse(
                        isString(xhr.responseText) ? xhr.responseText : undf,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {

                    xhr.responseData = null;

                    try {
                        xhr.responseData = self._ajax.returnResponse(
                            isString(xhr.responseText) ? xhr.responseText : undf,
                            xhr.getResponseHeader("content-type") || ''
                        );
                    }
                    catch (thrownErr) {
                        error(thrownError);
                    }

                    deferred.reject(xhr);
                }
            }
        },

        abort: function() {
            var self    = this;
            self._xhr.onreadystatechange = emptyFn;
            self._xhr.abort();
        },

        send: function() {

            var self    = this,
                opt     = self._opt;

            try {
                self._xhr.open(opt.method, opt.url, true, opt.username, opt.password);
                self.setHeaders();
                self._xhr.send(opt.data);
            }
            catch (thrownError) {
                error(thrownError);
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        }
    });

}());




/**
 * Function that returns false
 * @function returnFalse
 * @returns {boolean}
 */
function returnFalse() {
    return false;
};

/**
 * Function that returns true
 * @function returnTrue
 * @returns {boolean}
 */
function returnTrue() {
    return true;
};

/**
 * Check if given value is a null value
 * @function isNull
 * @param {*} value 
 * @returns {boolean}
 */
function isNull(value) {
    return value === null;
};



// from jQuery

var lib_DomEvent = MetaphorJs.lib.DomEvent = function(){

var DomEvent = function DomEvent(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
        }
    }


    // Event object
    self.originalEvent = src;
    self.type = src.type;

    if (!self.target && src.srcElement) {
        self.target = src.srcElement;
    }


    var eventDoc, doc, body,
        button = src.button;

    // Calculate pageX/Y if missing and clientX/Y available
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || window.document : window.document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        self.pageX = src.clientX +
                      ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                      ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        self.pageY = src.clientY +
                      ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                      ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
                                  // Support: Android<4.0
                              src.returnValue === false ?
                              returnTrue :
                              returnFalse;


    // Create a timestamp if incoming event doesn't have one
    self.timeStamp = src && src.timeStamp || (new Date).getTime();
};

// Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
extend(DomEvent.prototype, {

    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;
        e.cancelBubble = true;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);

return DomEvent;

}();




var dom_normalizeEvent = MetaphorJs.dom.normalizeEvent = function(originalEvent) {
    return new lib_DomEvent(originalEvent);
};


// from jquery.mousewheel plugin





var _mousewheelHandler = function(e) {

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    var nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function mousewheelHandler(e) {

            var event = dom_normalizeEvent(e || window.event),
                args = slice.call(arguments, 1),
                delta = 0,
                deltaX = 0,
                deltaY = 0,
                absDelta = 0,
                offsetX = 0,
                offsetY = 0;


            event.type = 'mousewheel';

            // Old school scrollwheel delta
            if ('detail'      in event) { deltaY = event.detail * -1; }
            if ('wheelDelta'  in event) { deltaY = event.wheelDelta; }
            if ('wheelDeltaY' in event) { deltaY = event.wheelDeltaY; }
            if ('wheelDeltaX' in event) { deltaX = event.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                deltaX = deltaY * -1;
                deltaY = 0;
            }

            // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
            delta = deltaY === 0 ? deltaX : deltaY;

            // New school wheel delta (wheel event)
            if ('deltaY' in event) {
                deltaY = event.deltaY * -1;
                delta = deltaY;
            }
            if ('deltaX' in event) {
                deltaX = event.deltaX;
                if (deltaY === 0) { delta = deltaX * -1; }
            }

            // No change actually happened, no reason to go any further
            if (deltaY === 0 && deltaX === 0) { return; }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

            if (!lowestDelta || absDelta < lowestDelta) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if (shouldAdjustOldDeltas(event, absDelta)) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(event, absDelta)) {
                // Divide all the things by 40!
                delta /= 40;
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
            deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
            deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if (this.getBoundingClientRect) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            // Add event and delta to the front of the arguments
            args.unshift(event, delta, deltaX, deltaY);

            // Clearout lowestDelta after sometime to better
            // handle multiple device types that give different
            // a different lowestDelta
            // Ex: trackpad = 3 and mouse wheel = 120
            if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
            nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);



            return fn.apply(this, args);
        }
    };

    mousewheelHandler.events = function() {
        var doc = window.document;
        return ( 'onwheel' in doc || doc.documentMode >= 9 ) ?
               ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    };

    return mousewheelHandler;

}();




var dom_addListener = MetaphorJs.dom.addListener = function(){

    var fn = null,
        prefix = null;

    return function addListener(el, event, func) {

        if (fn === null) {
            if (el.addEventListener) {
                fn = "addEventListener";
                prefix = "";
            }
            else {
                fn = "attachEvent";
                prefix = "on";
            }
            //fn = el.attachEvent ? "attachEvent" : "addEventListener";
            //prefix = el.attachEvent ? "on" : "";
        }


        if (event == "mousewheel") {
            func = _mousewheelHandler(func);
            var events = _mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();






    
var ajax_transport_Script = MetaphorJs.ajax.transport.Script = cls({

    type: "script",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            script  = document.createElement("script");

        dom_setAttr(script, "async", "async");
        dom_setAttr(script, "charset", "utf-8");
        dom_setAttr(script, "src", self._opt.url);

        dom_addListener(script, "load", bind(self.onLoad, self));
        dom_addListener(script, "error", bind(self.onError, self));

        document.head.appendChild(script);

        self._el = script;
    },

    onLoad: function(evt) {
        if (this._deferred) { // haven't been destroyed yet
            this._deferred.resolve(evt);
        }
    },

    onError: function(evt) {
        this._deferred.reject(evt);
    },

    abort: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    },

    onDestroy: function() {

        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }
});








var ajax_transport_IFrame = MetaphorJs.ajax.transport.IFrame = cls({

    type: "iframe",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,
    _sent: false,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            frame   = document.createElement("iframe"),
            id      = "frame-" + nextUid(),
            form    = self._opt.form;

        dom_setAttr(frame, "id", id);
        dom_setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        dom_setAttr(form, "action", self._opt.url);
        dom_setAttr(form, "target", id);

        dom_addListener(frame, "load", bind(self.onLoad, self));
        dom_addListener(frame, "error", bind(self.onError, self));

        self._el = frame;

        var tries = 0;

        var submit = function() {

            tries++;

            try {
                form.submit();
                self._sent = true;
            }
            catch (thrownError) {
                error(thrownError);
                if (tries > 2) {
                    self._deferred.reject(thrownError);
                }
                else {
                    async(submit, null, [], 1000);
                }
            }
        };

        submit();
    },

    onLoad: function() {

        var self    = this,
            frame   = self._el,
            doc,
            data;

        if (!self._sent) {
            return;
        }

        if (self._opt && !self._opt.jsonp) {

            try {
                doc = frame.contentDocument || frame.contentWindow.document;
                data = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
            catch (thrownError) {
                error(thrownError);
                self._deferred.reject(thrownError);
            }
        }
    },

    onError: function(evt) {

        if (!this._sent) {
            return;
        }

        this._deferred.reject(evt);
    },

    abort: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    },

    onDestroy: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }

});















var ajax_Ajax = MetaphorJs.ajax.Ajax = (function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new lib_Observable,

        formDataSupport = !!(window && window.FormData),

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(data.trim());
                return selector ? dom_select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? dom_select(selector, doc) : doc;
            }
            else if (type == "fragment") {
                var fragment    = document.createDocumentFragment(),
                    div         = document.createElement("div");

                div.innerHTML   = data;

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }

                return fragment;
            }
            else if (type === "json" || !type && ct.indexOf("json") >= 0) {
                return JSON.parse(data.trim());
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        },


        fixUrlDomain    = function(url) {

            if (url.substr(0,1) == "/") {
                return location.protocol + "//" + location.host + url;
            }
            else {
                return url;
            }
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (!opt.allowCache) {

                var stamp   = (new Date).getTime();

                url = rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                      url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                      url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && opt.method != "POST" && !opt.contentType && (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? ajax_serializeParam(opt.data) : opt.data;
                url += (rquery.test(url) ? "&" : "?") + opt.data;
                opt.data = null;
            }

            return url;
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                dom_setAttr(input, "type", "hidden");
                dom_setAttr(input, "name", name);
                dom_setAttr(input, "value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        data2form(data[i], form, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },


        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
        serializeForm   = function(form) {

            var oField, sFieldType, nFile, obj = {};

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (dom_getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                                dom_getAttr(oField, "type").toUpperCase() : 
                                "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         obj[oField.name] = oField.files[nFile++].name){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    obj[oField.name] = oField.value;
                }
            }

            return ajax_serializeParam(obj);
        },

        globalEval = function(code){
            var script, indirect = eval;
            if (code) {
                if (/^[^\S]*use strict/.test(code)) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script)
                        .parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        };

    /**
     * @class MetaphorJs.ajax.Ajax
     * @mixes mixin_Promise
     */
    return cls({

        $mixins: [mixin_Promise],

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        /**
         * @method
         * @constructor
         * @param {object} opt See ajax.defaults
         */
        $init: function(opt) {

            if (opt.url) {
                opt.url = fixUrlDomain(opt.url);
            }

            var self        = this,
                href        = window ? window.location.href : "",
                local       = rurl.exec(href.toLowerCase()) || [],
                parts       = rurl.exec(opt.url.toLowerCase());

            self._opt       = opt;

            if (opt.crossDomain !== true && opt.ignoreCrossDomain !== true) {
                opt.crossDomain = !!(parts &&
                                     (parts[1] !== local[1] || parts[2] !== local[2] ||
                                      (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                      (local[3] || (local[1] === "http:" ? "80" : "443"))));
            }

            var transport;

            if (opt.files) {
                if (!formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.transport == "iframe" && !opt.form) {
                self.createForm();
                opt.form = self._form;
            }
            else if (opt.form) {
                self._form = opt.form;
                if (opt.method == "POST" && !formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.form && opt.transport != "iframe" && opt.method == "POST") {
                if (formDataSupport) {
                    opt.data = new FormData(opt.form);
                }
                else {
                    opt.contentType = "application/x-www-form-urlencoded";
                    opt.data = serializeForm(opt.form);
                }
            }
            else if (opt.contentType === "json") {
                opt.contentType = opt.contentTypeHeader || "text/plain";
                opt.data = isString(opt.data) ? opt.data : JSON.stringify(opt.data);
            }
            else if (isPlainObject(opt.data) && opt.method == "POST" && formDataSupport) {

                var d = opt.data,
                    k;

                opt.data = new FormData;

                for (k in d) {
                    opt.data.append(k, d[k]);
                }
            }

            if (opt.files) {
                self.importFiles();
            }

            opt.url = prepareUrl(opt.url, opt);

            if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
                transport   = new ajax_transport_Script(opt, self.$$promise, self);
            }
            else if (opt.transport == "iframe") {
                transport   = new ajax_transport_IFrame(opt, self.$$promise, self);
            }
            else {
                transport   = new ajax_transport_XHR(opt, self.$$promise, self);
            }

            //self._deferred      = deferred;
            self._transport     = transport;

            /**
             * On successful request
             * @event success
             * @param {*} value response data
             */
            self.$$promise.done(function(value) {
                globalEvents.trigger("success", value);
            });

            /**
             * On request error
             * @event error
             * @param {*} reason
             */
            self.$$promise.fail(function(reason) {
                globalEvents.trigger("error", reason);
            });

            /**
             * On request end (success or failure)
             * @event end
             */
            self.$$promise.always(function(){
                globalEvents.trigger("end");
            });

            /**
             * On request start
             * @event start
             */
            globalEvents.trigger("start");


            if (opt.timeout) {
                self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
            }

            if (opt.jsonp) {
                self.createJsonp();
            }

            /**
             * Before sending data
             * @event before-send
             * @param {object} opt ajax options
             * @param {MetaphorJs.ajax.transport.*} transport 
             * @returns {boolean|null} return false to cancel the request
             */
            if (globalEvents.trigger("before-send", opt, transport) === false) {
                self.$$promise.reject();
            }
            if (opt.beforeSend && opt.beforeSend.call(opt.context, opt, transport) === false) {
                self.$$promise.reject();
            }

            if (self.$$promise.isPending()) {
                async(transport.send, transport);
                self.$$promise.always(self.asyncDestroy, self);
            }
            else {
                async(self.asyncDestroy, self, [], 1000);
            }
        },

        asyncDestroy: function() {

            var self = this;

            if (self.$isDestroyed()) {
                return;
            }

            if (self.$$promise.hasListeners()) {
                async(self.asyncDestroy, self, [], 1000);
                return;
            }

            self.$destroy();
        },

        /*promise: function() {
            return this._promise;
        },*/

        /**
         * Cancel ajax request
         * @method
         * @param {string} reason
         */
        abort: function(reason) {
            this.$$promise.reject(reason || "abort");
            this._transport.abort();
            //this._deferred.reject(reason || "abort");
            return this;
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        /**
         * Get current transport
         * @method
         * @returns {ajax_transport_XHR|ajax_transport_Script|ajax_transport_IFrame}
         */
        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            dom_setAttr(form, "method", self._opt.method);
            dom_setAttr(form, "enctype", "multipart/form-data");

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        importFiles: function() {

            var self    = this,
                opt     = self._opt,
                files   = opt.files,
                form    = self._form,
                data    = opt.data,
                i, l,
                j, jl,
                name,
                input,
                file,
                item;

            for (i = 0, l = files.length; i < l; i++) {

                item = files[i];

                if (isArray(item)) {
                    name = item[0];
                    file = item[1];
                }
                else {
                    if (window.File && item instanceof File) {
                        name = item.uploadName || ("upload" + (l > 1 ? "[]" : ""));
                    }
                    else {
                        name = item.name || "upload" + (l > 1 ? "[]" : "");
                    }
                    file = item;
                }

                if (!window.File || !(file instanceof File)) {
                    input = file;
                    file = null;
                }

                if (form) {
                    if (input) {
                        form.appendChild(input);
                    }
                }
                else {
                    if (file) {
                        data.append(name, file);
                    }
                    else if (input.files && input.files.length) {
                        for (j = 0, jl = input.files.length; j < jl; j++) {
                            data.append(name, input.files[j]);
                        }
                    }
                }
            }
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + nextUid();

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != strUndef) {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != strUndef) {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this,
                res;

            try {
                res = self.processResponseData(data);
            }
            catch (thrownError) {
                error(thrownError);
                if (self.$$promise) {
                    self.$$promise.reject(thrownError);
                }
                return;
            }

            if (self.$$promise) {
                self.$$promise.resolve(res);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("process-response")) {
                /**
                 * Process response data
                 * @event process-response
                 * @param {*} data response data
                 * @param {MetaphorJs.lib.Promise} promise Current request's promise
                 */
                globalEvents.trigger("process-response", data, self.$$promise);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.context, data, self.$$promise);
            }

            return data;
        },

        returnResponse: function(data, contentType) {

            var self    = this;

            if (!self._opt.jsonp) {
                return self.processResponseData(data, contentType);
            }

            return null;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self.$$promise,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                    return;
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject(new Error("jsonp script is empty"));
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject(new Error("jsonp script didn't invoke callback"));
                }
            }
        },

        onDestroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.$destroy();

            if (self._jsonpName) {
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }

    }, {
        prepareUrl: prepareUrl,
        global: globalEvents
    });
}());






/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    /**
     * The same set of options you can pass to ajax() and ajax.setup()
     * @var ajax.defaults 
     * @access private
     */
    var defaults    = {
            /**
             * @type {string} url Target url
             */
            url:            null,

            /**
             * @type {string|object} data Ajax payload
             */
            data:           null,

            /**
             * @type {string} method GET|POST|DELETE|PUT etc
             */
            method:         "GET",

            /**
             * @type {object} headers {
             *  Headers to add to XHR object:<br>
             *  Header-Name: header-value
             * }
             */
            headers:        null,

            /**
             * @type {string} username XHR username
             */
            username:       null,

            /**
             * @type {string} password XHR password
             */
            password:       null,

            /**
             * @type {string} dataType {
             * Response data type<br>
             * html|xml|json|fragment|script<br>
             * <code>html</code> - along with <code>selector</code> option treats
             * response as html, creates a document out of it and
             * returns selected element.<br>
             * <code>xml</code> - parse response as xml and return element(s)
             * using <code>selector</code> option<br>
             * <code>json</code> parse response as json and return the resulting
             * object<br>
             * <code>fragment</code> - turn response into a DocumentFragment<br>
             * <code>script</code> - evaluate response as a script
             */
            dataType:       null, // response data type

            /**
             * @type {int} timeout Abort on timeout
             */
            timeout:        0,

            /**
             * @type {string} contentType {
             *  Request content type. Set contentType: json to 
             *  transform data into json automatically and set 
             *  header to text/plain. 
             * }
             */
            contentType:    null, // request data type

            /**
             * @type {string} contentTypeHeader {
             *  If contentType = json, set this to specific header you want to send
             * }
             */
            contentTypeHeader: null,

            /**
             * @type {object} xhrFields Key:value pairs to set to xhr object
             */
            xhrFields:      null,

            /**
             * @type {boolean} jsonp Make a jsonp request
             */
            jsonp:          false,

            /**
             * @type {string} jsonParam {
             * Name of the parameter with callback
             * function name: url?<jsonParam>=<jsonCallback>
             * @default callback
             * }
             */
            jsonpParam:     null,

            /**
             * @type {string} jsonpCallback {
             *  Name of the callback function in global scope
             * }
             */
            jsonpCallback:  null,

            /**
             * @type {string} transport {
             *  iframe|xhr|script<br>
             *  If <code>files</code> or <code>form</code> options are set 
             *  and browser doesn't support FormData, 
             *  transport will be set to iframe.<br>
             * }
             */
            transport:      null,

            /**
             * @type {boolean} replace {
             *  When using <code>ajax.load(el, url, opt)</code>
             *  if replace=true, all contents of el will be replaced
             *  by response; <br>
             *  if replace=false, response will be appended.
             * }
             */
            replace:        false,

            /**
             * @type {string} selector See dataType
             */
            selector:       null,

            /**
             * @type {FormElement} form {
             *  Souce of request data and files, target url and request method
             * }
             */
            form:           null,

            /**
             * @type {function} beforeSend {
             *  @param {object} options Options passed to ajax()
             *  @param {object} transport Current transport object
             *  @returns {boolean|null} Return false to abort ajax
             * }
             */
            beforeSend:     null,

            /**
             * @type {function} progress XHR onprogress callback
             */
            progress:       null,

            /**
             * @type {function} XHR.upload progress callback
             */
            uploadProgress: null,

            /**
             * @type {function} processResponse {
             *  @param {*} response Either raw or pre-processed response data
             *  @param {MetaphorJs.lib.Promise} promise ajax's promise
             * }
             */
            processResponse:null,

            /**
             * @type {object} context All callback's context
             */
            context:        null,

            /**
             * @type {array} files Array of native File objects to send
             * via FormData or iframe
             */
            files:          null
        },

        defaultSetup    = {};


    /**
     * @function ajax
     * @param {string} url Url to load or send data to
     * @param {object} opt See ajax.defaults
     * @returns {ajax_Ajax}
     */

    /**
     * @function ajax
     * @param {object} opt See ajax.defaults
     * @returns {ajax_Ajax}
     */
    var ajax    = function ajax(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = dom_getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw new Error("Must provide url");
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = dom_getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return new ajax_Ajax(opt);
    };

    /**
     * Set default ajax options
     * @function ajax.setup
     * @param {object} opt See ajax.defaults
     */
    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true, true);
    };

    /**
     * Subscribe to global ajax events. See 
     * MetaphorJs.lib.Observable.on 
     * @function ajax.on
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.on     = function() {
        ajax_Ajax.global.on.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Unsubscribe from global ajax events. See 
     * MetaphorJs.lib.Observable.un 
     * @function ajax.un
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.un     = function() {
        ajax_Ajax.global.un.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Same as ajax(), method is forcefully set to GET
     * @function ajax.get
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    /**
     * Same as ajax(), method is forcefully set to POST
     * @function ajax.post
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    /**
     * Load response to given html element
     * @function ajax.load
     * @param {Element} el
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.load   = function(el, url, opt) {

        opt = opt || {};

        if (!isString(url)) {
            opt = url;
        }

        opt.dataType = "fragment";

        return ajax(url, opt).done(function(fragment){
            if (opt.replace) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
            el.appendChild(fragment);
        });
    };

    /**
     * Load script
     * @function ajax.loadScript
     * @param {string} url 
     * @returns {ajax_Ajax}
     */
    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    /**
     * Send form
     * @function ajax.submit
     * @param {FormElement} form
     * @param {object} opt
     * @returns {ajax_Ajax}
     */
    ajax.submit = function(form, opt) {
        opt = opt || {};
        opt.form = form;
        return ajax(null, opt);
    };

    /**
     * Utility function that prepares url by adding random seed or
     * jsonp params and does other stuff based on options
     * @function ajax.prepareUrl
     * @param {string} url 
     * @param {object} opt 
     */
    ajax.prepareUrl = function(url, opt) {
        return ajax_Ajax.prepareUrl(url, opt || {});
    };

    return ajax;
}();



return ajax;

};/* BUNDLE END 2LX */