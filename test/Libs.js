module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../src/LexerConfiguration",
    "../src/Parser",
    "path",
    "../src/Regex",
    "../src/Tokens",
    "../src/Translator",
    "core:Test.Unit:1.0.0"
]).then($imports => Object.assign({}, $imports[0], {
    Assertion: $imports[1],
    LexerConfiguration: $imports[2],
    Parser: $imports[3],
    Path: $imports[4],
    Regex: $imports[5],
    Tokens: $imports[6],
    Translator: $imports[7],
    Unit: $imports[8]
}));
