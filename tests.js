const Unit = require("./test/Libs").Unit;


Unit.Suite("Tool.SL")([
    require("./test/FloatTest"),
    require("./test/IntTest"),
    require("./test/LexerTest"),
    require("./test/LexerConfigurationTest"),
    require("./test/ParserTest"),
    require("./test/TranslatorTest")
])
    .then(Unit.showDetail)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);