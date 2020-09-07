
const extend      = require("metaphorjs-shared/src/func/extend.js"),
    isString    = require("metaphorjs-shared/src/func/isString.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");

require("metaphorjs/src/func/dom/getAttr.js");
require("../class/Ajax.js");

/*
* Contents of this file are partially taken from jQuery
*/

module.exports = function(){

    "use strict";

    /**
     * The same set of options you can pass to ajax() and ajax.setup()
     * @object ajax.defaults 
     * @access private
     */
    var defaults    = {
            /**
             * @property {string} url Target url
             */
            url:            null,

            /**
             * @property {string|object} data Ajax payload
             */
            data:           null,

            /**
             * @property {string} method GET|POST|DELETE|PUT etc
             */
            method:         "GET",

            /**
             * @property {object} headers {
             *  Headers to add to XHR object:<br>
             *  Header-Name: header-value
             * }
             */
            headers:        null,

            /**
             * @property {string} username XHR username
             */
            username:       null,

            /**
             * @property {string} password XHR password
             */
            password:       null,

            /**
             * @property {string} dataType {
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
             * @property {int} timeout Abort on timeout
             */
            timeout:        0,

            /**
             * @property {string} contentType {
             *  Request content type. Set contentType: json to 
             *  transform data into json automatically and set 
             *  header to text/plain. 
             * }
             */
            contentType:    null, // request data type

            /**
             * @property {string} contentTypeHeader {
             *  If contentType = json, set this to specific header you want to send
             * }
             */
            contentTypeHeader: null,

            /**
             * @property {object} xhrFields Key:value pairs to set to xhr object
             */
            xhrFields:      null,

            /**
             * @property {boolean} jsonp Make a jsonp request
             */
            jsonp:          false,

            /**
             * @property {string} jsonParam {
             * Name of the parameter with callback
             * function name: url?<jsonParam>=<jsonCallback>
             * @default callback
             * }
             */
            jsonpParam:     null,

            /**
             * @property {string} jsonpCallback {
             *  Name of the callback function in global scope
             * }
             */
            jsonpCallback:  null,

            /**
             * @property {string} transport {
             *  iframe|xhr|script<br>
             *  If <code>files</code> or <code>form</code> options are set 
             *  and browser doesn't support FormData, 
             *  transport will be set to iframe.<br>
             * }
             */
            transport:      null,

            /**
             * @property {boolean} replace {
             *  When using <code>ajax.load(el, url, opt)</code>
             *  if replace=true, all contents of el will be replaced
             *  by response; <br>
             *  if replace=false, response will be appended.
             * }
             */
            replace:        false,

            /**
             * @property {string} selector See dataType
             */
            selector:       null,

            /**
             * @property {FormElement} form {
             *  Souce of request data and files, target url and request method
             * }
             */
            form:           null,

            /**
             * @property {function} beforeSend {
             *  @param {object} options Options passed to ajax()
             *  @param {object} transport Current transport object
             *  @returns {boolean|null} Return false to abort ajax
             * }
             */
            beforeSend:     null,

            /**
             * @property {function} progress XHR onprogress callback
             */
            progress:       null,

            /**
             * @property {function} uploadProgress XHR.upload progress callback
             */
            uploadProgress: null,

            /**
             * @property {function} processResponse {
             *  @param {*} response Either raw or pre-processed response data
             *  @param {MetaphorJs.lib.Promise} promise ajax's promise
             * }
             */
            processResponse:null,

            /**
             * @property {object} context All callback's context
             */
            context:        null,

            /**
             * @property {array} files Array of native File objects to send
             * via FormData or iframe
             */
            files:          null
        },
        /**
         * @end-object
         */

        defaultSetup    = {};


    /**
     * @function ajax
     * @param {string} url Url to load or send data to
     * @param {object} opt See ajax.defaults
     * @returns {MetaphorJs.ajax.Ajax}
     */

    /**
     * @function ajax
     * @param {object} opt See ajax.defaults
     * @returns {MetaphorJs.ajax.Ajax}
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
                opt.url = MetaphorJs.dom.getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw new Error("Must provide url");
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = MetaphorJs.dom.getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return new MetaphorJs.ajax.Ajax(opt);
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
        MetaphorJs.ajax.Ajax.global.on.apply(MetaphorJs.ajax.Ajax.global, arguments);
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
        MetaphorJs.ajax.Ajax.global.un.apply(MetaphorJs.ajax.Ajax.global, arguments);
    };

    /**
     * Same as ajax(), method is forcefully set to GET
     * @function ajax.get
     * @param {string} url 
     * @param {object} opt 
     * @returns {MetaphorJs.ajax.Ajax}
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
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    /**
     * Load response to given html element
     * @function ajax.load
     * @param {HTMLElement} el
     * @param {string} url 
     * @param {object} opt 
     * @returns {MetaphorJs.ajax.Ajax}
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
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    /**
     * Send form
     * @function ajax.submit
     * @param {FormElement} form
     * @param {object} opt
     * @returns {MetaphorJs.ajax.Ajax}
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
        return MetaphorJs.ajax.Ajax.prepareUrl(url, opt || {});
    };

    return ajax;
}();


