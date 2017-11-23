module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../src/AST",
    "../src/Lexer",
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
    Lexer: $imports[3],
    LexerConfiguration: $imports[4],
    Parser: $imports[5],
    Path: $imports[6],
    Regex: $imports[7],
    Tokens: $imports[8],
    Translator: $imports[9],
    Unit: $imports[10]
}));
