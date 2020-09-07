
require("metaphorjs-promise/src/lib/Promise.js");

const cls         = require("metaphorjs-class/src/cls.js"),
    bind        = require("metaphorjs-shared/src/func/bind.js"),
    error       = require("metaphorjs-shared/src/func/error.js"),
    emptyFn     = require("metaphorjs-shared/src/func/emptyFn.js"),
    isString    = require("metaphorjs-shared/src/func/isString.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");


module.exports = MetaphorJs.ajax.transport.XHR = (function(){

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
                return (!r.status && window.location && 
                        window.location.protocol === "file:")
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
                        isString(xhr.responseText) ? xhr.responseText : undefined,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {

                    xhr.responseData = null;

                    try {
                        // dirty hack. Prevent response processing tools
                        // from resolving the promise.
                        // they are needed to process the response though
                        // even it failed. 
                        self._ajax.$$promise = new MetaphorJs.lib.Promise;
                        xhr.responseData = self._ajax.returnResponse(
                            isString(xhr.responseText) ? xhr.responseText : undefined,
                            xhr.getResponseHeader("content-type") || ''
                        );
                        self._ajax.$$promise = deferred;
                    }
                    catch (thrownErr) {
                        error(thrownErr);
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


