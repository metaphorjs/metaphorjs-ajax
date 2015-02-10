
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    bind        = require("metaphorjs/src/func/bind.js"),
    trim        = require("metaphorjs/src/func/trim.js"),
    async       = require("metaphorjs/src/func/async.js"),
    parseJSON   = require("metaphorjs/src/func/parseJSON.js"),
    parseXML    = require("metaphorjs/src/func/parseXML.js"),
    select      = require("metaphorjs-select/src/func/select.js"),
    isArray     = require("metaphorjs/src/func/isArray.js"),
    Observable  = require("metaphorjs-observable/src/lib/Observable.js"),
    Promise     = require("metaphorjs-promise/src/lib/Promise.js"),
    isString    = require("metaphorjs/src/func/isString.js"),
    isFunction  = require("metaphorjs/src/func/isFunction.js"),
    isObject    = require("metaphorjs/src/func/isObject.js"),
    isPlainObject= require("metaphorjs/src/func/isPlainObject.js"),
    isPrimitive = require("metaphorjs/src/func/isPrimitive.js"),
    error       = require("metaphorjs/src/func/error.js"),
    strUndef    = require("metaphorjs/src/var/strUndef.js"),
    nextUid     = require("metaphorjs/src/func/nextUid.js"),
    getAttr     = require("metaphorjs/src/func/dom/getAttr.js"),
    setAttr     = require("metaphorjs/src/func/dom/setAttr.js");

require("metaphorjs-promise/src/mixin/Promise.js");
require("./transport/XHR.js");
require("./transport/Script.js");
require("./transport/IFrame.js");

module.exports = (function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new Observable,

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
                doc = parseXML(trim(data));
                return selector ? select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? select(selector, doc) : doc;
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
                return parseJSON(trim(data));
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        },

        buildParams     = function(data, params, name) {

            var i, len;

            if (isPrimitive(data) && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(""+data));
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    buildParams(data[i], params, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        buildParams(data[i], params, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        prepareParams   = function(data) {
            var params = [];
            buildParams(data, params, null);
            return params.join("&").replace(/%20/g, "+");
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

            if (opt.cache === false) {

                var stamp   = (new Date).getTime();

                url = rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                      url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                      url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? prepareParams(opt.data) : opt.data;

                if (rgethead.test(opt.method)) {
                    url += (rquery.test(url) ? "&" : "?") + opt.data;
                    opt.data = null;
                }
            }

            return url;
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                setAttr(input, "type", "hidden");
                setAttr(input, "name", name);
                setAttr(input, "value", data);
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

            var oField, sFieldType, nFile, sSearch = "";

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                             getAttr(oField, "type").toUpperCase() : "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         sSearch += "&" + encodeURIComponent(oField.name) + "=" +
                                    encodeURIComponent(oField.files[nFile++].name)){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    sSearch += "&" + encodeURIComponent(oField.name) + "=" + encodeURIComponent(oField.value);
                }
            }

            return sSearch;
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

    defineClass({

        $class: "Ajax",
        $mixins: ["mixin.Promise"],

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        $init: function(opt) {

            if (opt.url) {
                opt.url = fixUrlDomain(opt.url);
            }

            var self        = this,
                href        = window ? window.location.href : "",
                local       = rurl.exec(href.toLowerCase()) || [],
                parts       = rurl.exec(opt.url.toLowerCase());

            self._opt       = opt;

            if (opt.crossDomain !== true) {
                opt.crossDomain = !!(parts &&
                                     (parts[1] !== local[1] || parts[2] !== local[2] ||
                                      (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                      (local[3] || (local[1] === "http:" ? "80" : "443"))));
            }

            //deferred    = new Promise,
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

            if (opt.form && opt.transport != "iframe") {
                if (opt.method == "POST") {
                    opt.data = new FormData(opt.form);
                }
                else {
                    opt.data = serializeForm(opt.form);
                }
            }
            else if (opt.method == "POST" && formDataSupport) {
                var d = opt.data,
                    k;
                opt.data = new FormData;

                if (isPlainObject(d)) {
                    for (k in d) {
                        opt.data.append(k, d[k]);
                    }
                }
            }

            if (opt.files) {
                self.importFiles();
            }

            opt.url = prepareUrl(opt.url, opt);

            if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
                transport   = new MetaphorJs.ajax.transport.Script(opt, self.$$promise, self);
            }
            else if (opt.transport == "iframe") {
                transport   = new MetaphorJs.ajax.transport.IFrame(opt, self.$$promise, self);
            }
            else {
                transport   = new MetaphorJs.ajax.transport.XHR(opt, self.$$promise, self);
            }

            //self._deferred      = deferred;
            self._transport     = transport;

            self.$$promise.done(function(value) {
                globalEvents.trigger("success", value);
            });
            self.$$promise.fail(function(reason) {
                globalEvents.trigger("error", reason);
            });
            self.$$promise.always(function(){
                globalEvents.trigger("end");
            });

            globalEvents.trigger("start");


            if (opt.timeout) {
                self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
            }

            if (opt.jsonp) {
                self.createJsonp();
            }

            if (globalEvents.trigger("before-send", opt, transport) === false) {
                self._promise = Promise.reject();
            }
            if (opt.beforeSend && opt.beforeSend.call(opt.context, opt, transport) === false) {
                self._promise = Promise.reject();
            }

            if (!self._promise) {
                async(transport.send, transport);

                //deferred.abort = bind(self.abort, self);
                self.$$promise.always(self.$destroy, self);

                //self._promise = deferred;
            }
        },


        /*promise: function() {
            return this._promise;
        },*/

        abort: function(reason) {
            this._transport.abort();
            this.$$promise.reject(reason || "abort");
            //this._deferred.reject(reason || "abort");
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            setAttr(form, "method", self._opt.method);
            setAttr(form, "enctype", "multipart/form-data");

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        importFiles: function() {

            var self    = this,
                opt     = self._opt,
                files   = opt.files,
                tr      = opt.transport,
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
                        name = "upload" + (l > 1 ? "[]" : "");
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
                if (self.$$promise) {
                    self.$$promise.reject(thrownError);
                }
                else {
                    error(thrownError);
                }
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
                globalEvents.trigger("process-response", data, self.$$promise);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.context, data, self.$$promise);
            }

            return data;
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
                    deferred.reject(thrownError);
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject("jsonp script is empty");
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject("jsonp script didn't invoke callback");
                }
            }
        },

        destroy: function() {

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


        global: globalEvents
    });


}());