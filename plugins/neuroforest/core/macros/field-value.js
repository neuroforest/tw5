/*\
title: $:/plugins/neuroforest/core/macros/field-value.js
type: application/javascript
module-type: macro

\*/

(function(){

"use strict";

exports.name = "field-value";

exports.params = [];

exports.run = function(title, field) {
  var tiddler, value;
  
  tiddler = $tw.wiki.getTiddler(title);
  if (tiddler) {
    value = tiddler.fields[field];
    if (value) {
      return value;
    }
  }
  return "";
};

})();