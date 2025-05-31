/*\
title: $:/plugins/neuroforest/core/macros/pdf-link.js
type: application/javascript
module-type: macro
\*/
(function(){

"use strict";

exports.name = "pdf-link";

exports.params = [
  {"name": "pdf"},
  {"name": "page"}
];

exports.run = function(pdf, page) {
  console.log("RUNNING PDF-LINK.")
  var pdfTiddler = $tw.wiki.getTiddler(pdf);
  if (pdfTiddler && pdfTiddler.fields["link.pdf"]) {
    var pdfUrl = pdfTiddler.fields["link.pdf"];
    var fullPdfUrl = pdfUrl + "#" + page;
    var pdfLink = "[[Open PDF|" + fullPdfUrl + "]]";
    return pdfLink;
  } else {
    return;
  }
};

})();