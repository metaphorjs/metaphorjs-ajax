
require("metaphorjs-promise/src/lib/Promise.js");

var cls         = require("metaphorjs-class/src/cls.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ajax.transport.Fetch = (function(){
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

        send: function() {

            var self    = this,
                opt     = self._opt;

            console.log("fetch", opt)

            try {
                self._deferred.after(window.fetch(opt.url, opt));
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
});