/*\
title: $:/plugins/neuroforest/core/macros/field-value.js
type: application/javascript
module-type: macro

\*/

(function(){

"use strict";

exports.name = "field-value";

exports.params = [
  {"name": "title"},
  {"name": "field"}
];

exports.run = function(title, field) {
  var tiddler, value;
  
  tiddler = this.wiki.getTiddler(title);
  if (tiddler) {
    value = tiddler.fields[field];
    if (value) {
      return value;
    }
  }
};

})();