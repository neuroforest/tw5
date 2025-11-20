/*\
title: $:/plugins/neuroforest/core/event/hooks.js
type: application/javascript
module-type: startup
\*/

const fs = require("fs");

/*
Log message to local file system
*/
function logLocal(messageElements, suffix) {
  if (messageElements[0].startsWith("Draft of ")) {
    return;
  }
  var storageTiddler = $tw.wiki.getTiddler("$:/config/neuroforest/storage");
  if (storageTiddler) {
    var storagePath = storageTiddler.fields.text;
  } else {
    return;
  }
  var now = new Date();
  var yearMonth = $tw.utils.formatDateString(now, "YYYY-0MM");
  var yearMonthDay = $tw.utils.formatDateString(now, "YYYY-0MM-0DD");
  var moment = $tw.utils.stringifyDate(now);
  messageElements.unshift(moment);

  var logDir = `${storagePath}/logs/${yearMonth}`

  if (!fs.existsSync(logDir)) {
    fs.mkdir(logDir, { recursive: true }, function(err) {
      if (err) throw err;
        console.log(`Error creating directory ${logDir}`);
    });
  }

  var logFile = `${logDir}/${yearMonthDay}-${suffix}.txt`;
  var log = messageElements.join("|") + "\n";
  fs.appendFile(logFile, log, function(err) {
    if (err) {
      console.error("Error writing to file:", err);
    }
  });
  console.log(`neuroforest/core: Log navigation to '${messageElements[1]}'`)
}


$tw.hooks.addHook("th-saving-tiddler", function(tiddler) {
  if (!tiddler.fields["neuro.id"]) {
    console.log(`neuroforest/core: Adding "neuro.id" field: ${tiddler.fields.title}`)
    var newTiddler = new $tw.Tiddler(tiddler.fields, {"neuro.id": $tw.utils.genUUID()});
  } else {
    var newTiddler = tiddler;
  }
  logLocal([tiddler.fields["title"], newTiddler.fields["neuro.id"]], "save");
  return newTiddler;
});

$tw.hooks.addHook("th-navigating", function(tiddler) {
  var target = tiddler.navigateTo;
  var targetTiddler = $tw.wiki.getTiddler(target);
  if (!targetTiddler) {
    return tiddler;
  } else {
    var targetUuid = $tw.wiki.getTiddler(target).fields["neuro.id"];
    if (tiddler.navigateFromTitle) {
      var source = tiddler.navigateFromTitle;
      var sourceUuid = $tw.wiki.getTiddler(source).fields["neuro.id"];
      logLocal([target, targetUuid, source, sourceUuid], "navigate")
    } else {
      logLocal([target, targetUuid, "", ""], "navigate")
    }
    return tiddler;
  }
});
