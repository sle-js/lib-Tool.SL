module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../src/AST",
    "../src/LexerConfiguration",
    "../src/Parser",
    "path",
    "../src/Regex",
    "../src/Tokens",
    "../src/Translator",
    "core:Test.Unit:1.0.0"
]).then($imports => Object.assign({}, $imports[0], {
    Assertion: $imports[1],
    AST: $imports[2],
    LexerConfiguration: $imports[3],
    Parser: $imports[4],
    Path: $imports[5],
    Regex: $imports[6],
    Tokens: $imports[7],
    Translator: $imports[8],
    Unit: $imports[9]
}));
