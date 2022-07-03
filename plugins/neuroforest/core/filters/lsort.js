/*\
title: $:/core/modules/filters/lsort.js
type: application/javascript
module-type: filteroperator

Filter operator for sorting

lsort[] : sort by tiddler size
lsort[fieldname] : sort by length of fieldname's value

Source: https://groups.google.com/g/tiddlywiki/c/hr75FTeEL_g/m/tFQ-ZIQoMLwJ
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter function
*/

exports.lsort = function(source,operator,options) {
    var isDescending = operator.prefix === "!";
    var results = [];
    if(operator.operand === "") {
        source(function(tiddler,title) {
            var len = $tw.wiki.getTiddlerAsJson(title).length;
            results.push( { "title": title, "len": len } );
        });
    }
    else {
        source(function(tiddler,title) {
            var tdlr = $tw.wiki.getTiddler(title);
            var len = 0;
            if(tdlr) {
                len = (tdlr.fields[operator.operand] || "").length;
            }
            results.push( { "title": title, "len": len } );
        });
    }
    results.sort(function(a,b) {
        return isDescending ? b.len - a.len : a.len - b.len;
    });
    for( var i = results.length; i--;) {
        results[i] = results[i].title;
    }
    return results;
};
})();