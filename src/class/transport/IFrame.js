require("../../__init.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/setAttr.js");

var cls         = require("metaphorjs-class/src/cls.js"),
    error       = require("metaphorjs-shared/src/func/error.js"),
    bind        = require("metaphorjs-shared/src/func/bind.js"),
    nextUid     = require("metaphorjs-shared/src/func/nextUid.js"),
    async       = require("metaphorjs-shared/src/func/async.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


module.exports = MetaphorJs.ajax.transport.IFrame = cls({

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

        MetaphorJs.dom.setAttr(frame, "id", id);
        MetaphorJs.dom.setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        MetaphorJs.dom.setAttr(form, "action", self._opt.url);
        MetaphorJs.dom.setAttr(form, "target", id);

        MetaphorJs.dom.addListener(frame, "load", bind(self.onLoad, self));
        MetaphorJs.dom.addListener(frame, "error", bind(self.onError, self));

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
