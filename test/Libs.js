module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../src/ASTTranslator",
    "../src/ES2015Translator",
    "../src/LexerConfiguration",
    "../src/Parser",
    "path",
    "../src/Regex",
    "../src/Tokens",
    "../src/TypeInference",
    "core:Test.Unit:1.0.0"
]).then($imports => Object.assign({}, $imports[0], {
    ASTTranslator: $imports[2],
    Assertion: $imports[1],
    ES2015Translator: $imports[3],
    LexerConfiguration: $imports[4],
    Parser: $imports[5],
    Path: $imports[6],
    Regex: $imports[7],
    Tokens: $imports[8],
    TypeInference: $imports[9],
    Unit: $imports[10]
}));
