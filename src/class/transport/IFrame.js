
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    bind        = require("metaphorjs/src/func/bind.js"),
    addListener = require("metaphorjs/src/func/event/addListener.js"),
    error       = require("metaphorjs/src/func/error.js"),
    nextUid     = require("metaphorjs/src/func/nextUid.js"),
    setAttr     = require("metaphorjs/src/func/dom/setAttr.js"),
    async       = require("metaphorjs/src/func/async.js");


module.exports = defineClass({

    $class: "ajax.transport.IFrame",

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

        setAttr(frame, "id", id);
        setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        setAttr(form, "action", self._opt.url);
        setAttr(form, "target", id);

        addListener(frame, "load", bind(self.onLoad, self));
        addListener(frame, "error", bind(self.onError, self));

        self._el = frame;

        var tries = 0;

        var submit = function() {

            tries++;

            try {
                form.submit();
                self._sent = true;
            }
            catch (thrownError) {
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

    destroy: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }

});
