/*\
title: $:/plugins/neuroforest/core/server/routes/get-neuro-fields.js
type: application/javascript
module-type: route

GET /neuro/fields.json?filter=<filter>&fields=<fields>

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var DEFAULT_FILTER = "[all[tiddlers]!is[system]sort[title]]",
DEFAULT_FIELDS = "neuro_id,tags,title"

exports.method = "GET";

exports.path = /^\/neuro\/fields.json$/;

exports.handler = function(request,response,state) {
  var filter = state.queryParameters.filter || DEFAULT_FILTER;
  if($tw.wiki.getTiddlerText("$:/config/Server/AllowAllExternalFilters") !== "yes") {
    if($tw.wiki.getTiddlerText("$:/config/Server/ExternalFilters/" + filter) !== "yes") {
      console.log("Blocked attempt to GET /recipes/default/tiddlers/tiddlers.json with filter: " + filter);
      response.writeHead(403);
      response.end();
      return;
    }
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  var titles = state.wiki.filterTiddlers(filter),
    tiddlers = [],
    fields = state.queryParameters.fields || DEFAULT_FIELDS;
  if (! Array.isArray(fields)) {
    fields = new Array(fields);
  }
  $tw.utils.each(titles, function(title) {
    var tiddler = state.wiki.getTiddler(title),
      tiddlerFields = {};
    for (var i = 0, length = fields.length; i < length; i++) {
      var currentField = fields[i];
      if (currentField in tiddler.fields) {
        if (currentField === "text") {
          tiddlerFields[currentField] = tiddler.getFieldString(currentField);
        } else {
          tiddlerFields[currentField] = tiddler.fields[currentField];
        }
      }
    }
    if (Object.keys(tiddlerFields).length !== 0) {
     tiddlers.push(tiddlerFields);
    }
  });
  var text = JSON.stringify(tiddlers);
  response.end(text,"utf8");
};

}());