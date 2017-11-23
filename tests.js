module.exports = $import(
    "./test/Libs"
).then($imports => {
    const Unit = $imports.Unit;

    return Unit.Suite("Tool.SL")([
        $import("./test/FloatTest"),
        $import("./test/LexerTest"),
        $import("./test/LexerConfigurationTest"),
        $import("./test/ParserTest"),
        $import("./test/TranslatorTest")
    ])
        .then(Unit.showErrors)
        .then(Unit.showSummary)
        .then(Unit.setExitCodeOnFailures);
}).catch(err => {
    console.error(err);
    process.exitCode = -1;
    return err;
});
