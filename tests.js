const Unit = require("./test/Libs").Unit;


require("./test/IntTest")
    .then(Unit.showErrors)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);