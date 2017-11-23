const Libs = require("../src/Libs");


module.exports = Object.assign({}, Libs, {
    Assertion: mrequire("core:Test.Unit.Assertion:2.0.1"),
    Lexer: require("../src/Lexer"),
    LexerConfiguration: require("../src/LexerConfiguration"),
    Regex: require("../src/Regex"),
    Tokens: require("../src/Tokens"),
    Unit: mrequire("core:Test.Unit:1.0.0")
});