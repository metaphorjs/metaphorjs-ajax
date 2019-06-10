

var cls         = require("metaphorjs-class/src/cls.js"),
    bind        = require("metaphorjs-shared/src/func/bind.js"),
    async       = require("metaphorjs-shared/src/func/async.js"),
    parseXML    = require("metaphorjs-shared/src/func/parseXML.js"),
    isArray     = require("metaphorjs-shared/src/func/isArray.js"),
    isString    = require("metaphorjs-shared/src/func/isString.js"),
    isFunction  = require("metaphorjs-shared/src/func/isFunction.js"),
    isObject    = require("metaphorjs-shared/src/func/isObject.js"),
    isPlainObject= require("metaphorjs-shared/src/func/isPlainObject.js"),
    error       = require("metaphorjs-shared/src/func/error.js"),
    strUndef    = require("metaphorjs-shared/src/var/strUndef.js"),
    nextUid     = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");

require("metaphorjs/src/func/dom/select.js")
require("metaphorjs-promise/src/mixin/Promise.js");
require("metaphorjs-observable/src/lib/Observable.js");
require("metaphorjs/src/func/dom/getAttr.js");
require("metaphorjs/src/func/dom/setAttr.js");
require("../func/ajax/serializeParam.js");
require("./transport/XHR.js");
require("./transport/Script.js");
require("./transport/IFrame.js");
require("./transport/Fetch.js");

module.exports = MetaphorJs.ajax.Ajax = (function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new MetaphorJs.lib.Observable,

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
                return selector ? MetaphorJs.dom.select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? MetaphorJs.dom.select(selector, doc) : doc;
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

            if (opt.data && opt.method != "POST" && !opt.contentType && 
                (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? 
                                MetaphorJs.ajax.serializeParam(opt.data) : 
                                opt.data;
                url += (rquery.test(url) ? "&" : "?") + opt.data;
                opt.data = null;
            }

            return url;
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                MetaphorJs.dom.setAttr(input, "type", "hidden");
                MetaphorJs.dom.setAttr(input, "name", name);
                MetaphorJs.dom.setAttr(input, "value", data);
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

                if (MetaphorJs.dom.getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                                MetaphorJs.dom.getAttr(oField, "type").toUpperCase() : 
                                "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         obj[oField.name] = oField.files[nFile++].name){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    obj[oField.name] = oField.value;
                }
            }

            return MetaphorJs.ajax.serializeParam(obj);
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
     * @mixes mixin:MetaphorJs.mixin.Promise
     */
    return cls({

        $mixins: [MetaphorJs.mixin.Promise],

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

            opt.transport   = opt.transport || MetaphorJs.ajax.Ajax.defaultTransport;

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
                opt.contentType = opt.contentTypeHeader || "application/json";
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

            /**
             * Before initializing transport
             * @event before-transport
             * @param {object} opt ajax options
             */
            globalEvents.trigger("before-transport", opt);

            if ((opt.crossDomain || opt.transport === "script") && !opt.form) {
                transport   = new MetaphorJs.ajax.transport.Script(opt, self.$$promise, self);
            }
            else if (opt.transport === "iframe") {
                transport   = new MetaphorJs.ajax.transport.IFrame(opt, self.$$promise, self);
            }
            else if (opt.transport === "fetch") {
                transport   = new MetaphorJs.ajax.transport.Fetch(opt, self.$$promise, self);
            }
            else if (opt.transport === "xhr") {
                transport   = new MetaphorJs.ajax.transport.XHR(opt, self.$$promise, self);
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
         * @returns {MetaphorJs.ajax.transport.*}
         */
        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            MetaphorJs.dom.setAttr(form, "method", self._opt.method);
            MetaphorJs.dom.setAttr(form, "enctype", "multipart/form-data");

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
        global: globalEvents,
        defaultTransport: "xhr"
    });
}());