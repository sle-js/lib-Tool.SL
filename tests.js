const Unit = require("./test/Libs").Unit;


Unit.Suite("All")([
    require("./test/IntTest"),
    require("./test/LexerTest")
])
    .then(Unit.showDetail)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);