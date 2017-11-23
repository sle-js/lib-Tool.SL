const Libs = require("../src/Libs");


module.exports = Object.assign({}, Libs, {
    Assertion: mrequire("core:Test.Unit.Assertion:2.0.1"),
    AST: require("../src/AST"),
    Lexer: require("../src/Lexer"),
    LexerConfiguration: require("../src/LexerConfiguration"),
    Parser: require("../src/Parser"),
    Path: require("path"),
    Regex: require("../src/Regex"),
    Tokens: require("../src/Tokens"),
    Translator: require("../src/Translator"),
    Unit: mrequire("core:Test.Unit:1.0.0")
});