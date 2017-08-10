const Unit = require("./test/Libs").Unit;


Unit.Suite("All")([
    require("./test/FloatTest"),
    require("./test/IntTest"),
    require("./test/LexerTest"),
    require("./test/LexerConfigurationTest"),
    require("./test/ParserTest")
])
    .then(Unit.showDetail)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);