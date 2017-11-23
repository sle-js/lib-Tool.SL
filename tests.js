module.exports = $import(
    "./test/Libs"
).then($imports =>
    $imports.Unit.Suite("Tool.SL")([
        require("./test/FloatTest"),
        require("./test/IntTest"),
        require("./test/LexerTest"),
        require("./test/LexerConfigurationTest"),
        require("./test/ParserTest"),
        require("./test/TranslatorTest")
    ])
        .then($imports.Unit.showDetail)
        .then($imports.Unit.showSummary)
        .then($imports.Unit.setExitCodeOnFailures)
).catch(err => {
    console.error(err);
    process.exitCode = -1;
    return err;
});
