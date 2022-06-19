/*\
title: $:/plugins/neuroforest/core/server/routes/get-neuro-index.js
type: application/javascript
module-type: route

GET /neuro/index.json?filter=<filter>

\*/
(function() {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";
  
  var DEFAULT_FILTER = "[all[tiddlers]sort[title]]";

  exports.method = "GET";

  exports.path = /^\/neuro\/index.json$/;
  
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
      tiddlers = [];
    $tw.utils.each(titles,function(title) {
      var tiddler = state.wiki.getTiddler(title),
        tiddlerFields = {};
      tiddlerFields.title = title;

      // Temporary warning
      if (tiddler == null) {
        console.log("CHECK FILTER!");
      }

      if ("tmap.id" in tiddler.fields) {
        tiddlerFields.neuro_id = tiddler.getFieldString("tmap.id");
      };
      if ("tags" in tiddler.fields) {
        tiddlerFields.tags = tiddler.fields["tags"];
      }
      tiddlers.push(tiddlerFields);
    });
    var text = JSON.stringify(tiddlers);
    response.end(text,"utf8");
  };
}());