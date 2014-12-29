
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    async       = require("metaphorjs/src/func/async.js"),
    addListener = require("metaphorjs/src/func/event/addListener.js"),
    error       = require("metaphorjs/src/func/error.js"),
    setAttr     = require("metaphorjs/src/func/dom/setAttr.js");


module.exports = defineClass({
    $class: "ajax.transport.Script",

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

        setAttr(script, "async", "async");
        setAttr(script, "charset", "utf-8");
        setAttr(script, "src", self._opt.url);

        addListener(script, "load", bind(self.onLoad, self));
        addListener(script, "error", bind(self.onError, self));

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

    destroy: function() {

        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }
});
