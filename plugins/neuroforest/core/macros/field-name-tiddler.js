/*\
title: $:/plugins/neuroforest/core/macros/field-name-tiddler.js
type: application/javascript
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "field-name-tiddler";

exports.params = [
  {"name": "field"}
];

exports.run = function(field) {
  var tiddlerMatch;
  $tw.wiki.each(function(tiddler, title) {
    var fieldName = tiddler.fields["field-name"];
   
    if (fieldName === field) {
      tiddlerMatch = tiddler;
    }
  });
  if (tiddlerMatch) {
    var link = $tw.utils.getLink(tiddlerMatch);
    return link;
  } else {
    window.alert("Not found:" + field);
    return "";
  }
};

})();