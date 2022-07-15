/*\
title: $:/plugins/neuroforest/core/server/routes/put-action.js
module-type: route
type: application/javascript

PUT /neuro/action/:action
\*/
(function() {

"use strict";

exports.method = "PUT";

exports.path = /^\/neuro\/action\/(.+)$/;

exports.handler = function(request,response,state) {
  var action = state.params[0];
  if (action === "merge") {
    var titles = state.queryParameters["titles"];
    var status = state.wiki.nfMerge(titles);
  } else if (action === "rename") {
    var oldTitle = state.queryParameters["oldTitle"];
    var newTitle = state.queryParameters["newTitle"];
    var status = state.wiki.nfRename(oldTitle, newTitle);
  } else if (action === "replace") {
    var oldText = state.queryParameters["oldText"];
    var newText = state.queryParameters["newText"];
    var filter = state.queryParameters["filter"];
    var status = state.wiki.nfReplace(oldText, newText, filter);
  } else if (action === "search") {
    var query = state.queryParameters["query"];
    var status = state.wiki.nfSearch(query);
  } else {
    var message = `Action is not supported ${action}`
    console.error(message);
    var status = {"code": 404, "message": message}
  }

  var statusCode = status.code;
  // Writing response
  if (statusCode === 200) {
    response.writeHead(200, status.message, {
      "Content-Type": "text/plain"
    });
  } else if (statusCode === 204) {
    response.writeHead(204, "OK", {
      "Content-Type": "text/plain"
    });
  } else {
    response.writeHead(statusCode, status.message, {
      "Content-Type": "text/plain"
    });
  }
	response.end();
}

}());
