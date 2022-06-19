/*\
title: $:/plugins/neuroforest/core/macros/field-to-link.js
type: application/javascript
module-type: macro
\*/

(function(){

"use strict";

exports.name = "field-to-link";

exports.params = [];

/*
Run the macro
*/
exports.run = function(title, field) {
  var tiddler, fieldString, fieldTiddler, displayName, link;
  
  tiddler = $tw.wiki.getTiddler(title);
  fieldString = tiddler.getFieldString(field);
  fieldTiddler = $tw.wiki.getTiddler(fieldString);
  if (fieldTiddler && fieldTiddler.fields.name) {
    displayName = fieldTiddler.getName();
    link = "[[" + displayName + "|" + fieldString + "]]";
  } else {
    link = "[[" + fieldString + "]]";
  }
  return link;
};

})();