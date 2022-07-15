/*\
title: $:/plugins/neuroforest/core/server/routes/put-fields.js
module-type: route
type: application/javascript

PUT /neuro/fields/:title
\*/
(function() {

"use strict";

exports.method = "PUT";

exports.path = /^\/neuro\/fields\/(.+)$/;

exports.handler = function(request,response,state) {
	var title = $tw.utils.decodeURIComponentSafe(state.params[0]),
	  fields = JSON.parse(state.data);

	var tiddler = $tw.wiki.getTiddler(title);
	$tw.wiki.addTiddler(new $tw.Tiddler(
	  tiddler.fields,
	  fields,
	  $tw.wiki.getModificationFields()
	));

	response.writeHead(204, "OK",{
		"Content-Type": "text/plain"
	});
	response.end();
};

}());
