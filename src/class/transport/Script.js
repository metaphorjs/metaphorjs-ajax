
require("../../__init.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/setAttr.js");

var cls         = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");
    
module.exports = MetaphorJs.ajax.transport.Script = cls({

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

        MetaphorJs.dom.setAttr(script, "async", "async");
        MetaphorJs.dom.setAttr(script, "charset", "utf-8");
        MetaphorJs.dom.setAttr(script, "src", self._opt.url);

        MetaphorJs.dom.addListener(script, "load", bind(self.onLoad, self));
        MetaphorJs.dom.addListener(script, "error", bind(self.onError, self));

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
