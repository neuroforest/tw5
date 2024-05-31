/*\
title: $:/plugins/neuroforest/core/server/routes/get-tiddler.js
module-type: route
type: application/javascript
GET /neuro/tiddlers/:title
\*/
(function() {

"use strict";

exports.method = "GET";

exports.path = /^\/neuro\/tiddlers\/(.+)$/;

exports.handler = function(request,response,state) {
  var title = decodeURIComponent(state.params[0]),
    tiddler = state.wiki.getTiddler(title),
    tiddlerFields = {};

  if(tiddler) {
    // Make a copy of tiddler fields.
    $tw.utils.each(tiddler.fields, function(field, name) {
      if (name === "text") {
        tiddlerFields[name] = tiddler.getFieldString(name);
      } else {
        tiddlerFields[name] = field;
      }
    })

    // Add server fields
    tiddlerFields.revision = state.wiki.getChangeCount(title);
    tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";

    // Write response 
    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    response.end(JSON.stringify(tiddlerFields),"utf8");
  } else {
    response.writeHead(404);
    response.end();
  }
};

}());