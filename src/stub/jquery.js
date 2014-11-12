

module.exports = function() {

   var $ = window.jQuery;

    var ajax = function() {
        return $.ajax.apply($, arguments);
    };

    ajax.setup  = function(opt) {
        $.ajaxSetup(opt);
    };

    ajax.on     = function() {};

    ajax.un     = function() {};

    ajax.get    = function() {
        return $.get.apply($, arguments);
    };

    ajax.post   = function(url, opt) {
        return $.post.apply($, arguments);
    };

    ajax.load   = function(el, url, opt) {
        return $.load.apply($, arguments);
    };

    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    ajax.submit = function() {};

    return ajax;

}();