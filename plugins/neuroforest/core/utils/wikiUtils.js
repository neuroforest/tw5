/*\
title: $:/plugins/neuroforest/core/utils/wikiUtils.js
module-type: wikimethod
type: application/javascript
\*/
(function() {

"use strict";

exports.nfCloseAll = function(title) {
  var altCEvent = new KeyboardEvent("keydown", {
    key: "c",
    code: "KeyC",
    keyCode: 67,
    altKey: true,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(altCEvent);
  return {"code": 204};
};

exports.nfOpen = function(title) {
  var tiddler = $tw.wiki.getTiddler(title);
  if (! tiddler) {
    var message = `Tiddler '${title}' does not exist.`;
    console.log(message);
    return {"code": 500, "message": message};
  } else {
    let actions=`<$navigator story="$:/StoryList" history="$:/HistoryList"><$action-navigate $to="${title}"/></$navigator>`;
    $tw.rootWidget.invokeActionString(actions);
    return {"code": 204}
  }
};
  
exports.nfRename = function(from, to) {
  var tiddler = $tw.wiki.getTiddler(from);
  if (! tiddler) {
    var message = `Tiddler '${from}' does not exist.`;
    console.log(message);
    return {"code": 500, "message": message};
  } else if ($tw.wiki.getTiddler(to)) {
    var message = `Target tiddler '${to}' already exists.`;
    console.log(message);
    return {"code": 500, "message": message};
  } else if (! to) {
    var message = `No target tiddler given.`;
    console.log(message);
    return {"code": 500, "message": message};
  } else {
    var backlinks = $tw.wiki.filterTiddlers(`[[${from}]backlinks[]]`);
    var tags = $tw.wiki.filterTiddlers(`[tag[${from}]]`);
    var modified = new Set([...backlinks, ...tags]);

    // Rename tiddler
    $tw.wiki.renameTiddler(from, to);

    // Rename backlinks
    for (var i = 0; i < backlinks.length; i++) {
      var backlinkTiddler = $tw.wiki.getTiddler(backlinks[i]);
      if (! backlinkTiddler) {
        continue;
      }
      var text = backlinkTiddler.fields.text;
      var linkRaw = `[[${from}]]`
      var linkCustom = `|${from}]]`
      var linkRawNew = `[[${to}]]`
      var linkCustomNew = `|${to}]]`
      var newText = text.split(linkRaw).join(linkRawNew);
      newText = newText.split(linkCustom).join(linkCustomNew);
      $tw.wiki.addTiddler(new $tw.Tiddler(backlinkTiddler.fields, {text: newText}))
    }

    // Handling primaries.
    var primaryTitles = $tw.wiki.filterTiddlers("[has[neuro.primary]]");
    $tw.utils.each(primaryTitles, function(title) {
      var primaryTiddler = $tw.wiki.getTiddler(title);
      var primary = primaryTiddler.fields["neuro.primary"];
      if (primary === from) {
        var newTiddler = new $tw.Tiddler(primaryTiddler.fields, {"neuro.primary": to});
        $tw.wiki.addTiddler(newTiddler);
        modified.add(title);
      }
    })
    return {"code": 200, "message": `${modified.size} tiddlers affected`}
  }
};

exports.nfRecode = function (from, to) {
  var filter = `[prefix[.${from}]]`
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  $tw.utils.each(tiddlerTitles, function (title) {
    var newTitle = title.replace(from, to);
    $tw.wiki.nfRename(title, newTitle);
    // TODO: handle encoding
  })
  
};

exports.nfAddFields = function(filter, newFields) {
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  if (tiddlerTitles == false) {
    console.log(`Filter "${filter}" selected 0 tiddlers.`);
  }

  $tw.utils.each(tiddlerTitles, function(title) {
    var tiddler = $tw.wiki.getTiddler(title);
    $tw.wiki.addTiddler(new $tw.Tiddler(tiddler, newFields));
  })
};

exports.nfDeleteFields = function(filter, fieldsToRemove) {
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  if (tiddlerTitles == false) {
    console.log(`Filter "${filter}" selected 0 tiddlers.`);
  }

  $tw.utils.each(tiddlerTitles, function(title) {
    var tiddler = $tw.wiki.getTiddler(title);
    
    var currentFields = Object.keys(tiddler.fields);

    var newFields = {};
    currentFields.forEach(function(fieldName) {
      if (fieldsToRemove.indexOf(fieldName) !== -1) {
        return;
      } else {
        newFields[fieldName] = tiddler.fields[fieldName];
      }
    })
    
    $tw.wiki.addTiddler(new $tw.Tiddler(newFields));
  })
};

exports.nfDisplayTiddlers = function(filter, mode="add") {
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  var story = new $tw.Story();

  if (mode === "clear") {
    var newFields = {
      "list": ""
    }
    $tw.wiki.nfAddFields("[title[$:/StoryList]]", newFields);
  }
  tiddlerTitles.forEach(function(title) {
    story.addToStory(title);
  })
};

exports.nfReplace = function(oldText, newText, filter) {
  filter = filter || `[all[tiddlers]search:*:casesensitive,literal[${oldText}]] -[prefix[$:/]]`;
  if (! oldText || !newText) {
    var message = "Arguments not valid";
    console.error(message);
    return {"code": 500, "message": message};
  }
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);
  if (tiddlerTitles.length === 0) {
    var message = "0 tiddlers affected";
    console.error(message);
    return {"code": 500, "message": message};
  }

  var count = 0;
  $tw.utils.each(tiddlerTitles, function(title) {
    var tiddler = $tw.wiki.getTiddler(title);
    var newFields = {};

    if (! tiddler) {
        var message = `Tiddler '${title}' was not found`;
        console.error(message);
    }

    // Do not replace text in identifiers
    for (var field in tiddler.fields) {
      var ignoreFields = ["title", "neuro.id", "tmap.id"];
      if (ignoreFields.indexOf(field) > -1) {
        continue;
      } else if (typeof tiddler.fields[field] === "string") {
        var newValue = tiddler.fields[field].split(oldText).join(newText);
      } else {
        console.log(tiddler.fields[field]);
        continue;
      }
      if (newValue !== tiddler.fields[field]) {
        newFields[field] = newValue;
      }
    }

    if (Object.keys(newFields).length > 0) {
      $tw.wiki.addTiddler(new $tw.Tiddler(tiddler.fields, newFields));
      count += 1;
    }
  })
  return {"code": 200, "message": `${count} tiddlers affected`};
};

exports.nfRenameTiddlers = function(filter, fromText, toText) {
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  $tw.utils.each(tiddlerTitles, function(title) {
    if (title.includes(fromText)) {
      var newTitle = title.replace(fromText, toText);
      $tw.wiki.nfRename(title, newTitle);
    }
  })
};

exports.nfDeleteTiddlers = function(filter) {
  var tiddlerTitles = $tw.wiki.filterTiddlers(filter);

  $tw.utils.each(tiddlerTitles, function(title) {
    $tw.wiki.deleteTiddler(title);
    }
  )
};

exports.nfMerge = function(tiddlerTitles) {
  // Check the input
  if (! Array.isArray(tiddlerTitles)) {
    var message = "The argument is not an Array";
    console.error(message);
    return {"code": 500, "message": message};
  }

  var tiddlers = new Array();
  var tiddlers = tiddlerTitles.map(function(tiddlerTitle) {
    var tiddler = $tw.wiki.getTiddler(tiddlerTitle);
    return tiddler;
  })

  // Determine if all tiddlers exist
  var invalidTiddlers = new Array();
  for (var i = 0; i < tiddlers.length; i++) {
    var title = tiddlerTitles[i];
    var tiddler = tiddlers[i];
    if (! tiddler) {
      invalidTiddlers.push(title);
    }
  }
  if (invalidTiddlers.length) {
    var message = `Invalid tiddlers: ${invalidTiddlers.join(", ")}`;
    return {"code": 500, "message": message}
  }

  var tiddlerFields = new Object();
  tiddlers.forEach(function(tiddlerNew) {
    Object.assign(tiddlerFields, tiddlerNew.fields);
  })

  var targetTitle = tiddlerFields.title;

  tiddlers.forEach(function(tiddlerNew) {
    $tw.wiki.relinkTiddler(tiddlerNew.fields.title, targetTitle);
    $tw.wiki.deleteTiddler(tiddlerNew.fields.title);
  })

  $tw.wiki.addTiddler(new $tw.Tiddler(tiddlerFields));
  return {"code": 204};
}

exports.nfSearch = function(query) {
  var altSEvent = new KeyboardEvent("keydown", {
    key: "s",
    code: "KeyS",          
    keyCode: 83,
    altKey: true,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(altSEvent);

  var input = document.getElementsByClassName("tc-sidebar-search")[0].getElementsByTagName("input")[0];
  input.value = query;

  $tw.wiki.addTiddler({title: "$:/temp/search/input", text: query});

  return {"code": 204};
}

})();