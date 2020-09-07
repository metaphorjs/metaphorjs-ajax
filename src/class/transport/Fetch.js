
require("metaphorjs-promise/src/lib/Promise.js");

const cls         = require("metaphorjs-class/src/cls.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ajax.transport.Fetch = (function(){

    var accepts     = {
        xml:        "application/xml, text/xml",
        html:       "text/html",
        script:     "text/javascript, application/javascript",
        json:       "application/json, text/javascript",
        text:       "text/plain",
        _default:   "*/*"
    };

    return cls({

        type: "fetch",
        _deferred: null,


        $init: function(opt, deferred, ajax) {

            var self    = this;

            self._deferred      = deferred;
            self._opt           = opt;
            self._ajax          = ajax;

            opt.body = opt.data;
        },

        setHeaders: function() {

            var self = this,
                opt = self._opt;

            opt.headers = opt.headers || {};

            if (opt.data && opt.contentType) {
                opt.headers["Content-Type"] = opt.contentTypeHeader || opt.contentType
            }
            opt.headers["X-Requested-With"] = "Fetch";
            opt.headers["Accept"] =
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default;
        },

        send: function() {

            var self    = this,
                opt     = self._opt,
                p,
                respCT;

            try {
                self.setHeaders();
                p = window.fetch(opt.url, opt);
                
                p.then(
                    function(resp){
                        respCT = resp.headers.map['content-type'] || "";
                        return resp.text();
                    }, 
                    function(reason){
                        self._deferred.reject(reason);
                    }
                )
                .then(function(respText){
                    self._ajax.processResponse(
                        respText,
                        respCT
                    );
                })
            }
            catch (thrownError) {
                error(thrownError);
                self._deferred = new MetaphorJs.lib.Promise;
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        }
    });
}());