const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Tokens = require("../src/Tokens");
const LexerConfiguration = require("../src/LexerConfiguration");


const listEquals = l1 => l2 =>
    (l1.length === 0 && l2.length === 0)
        ? true
        : (l1.length === 0 || l2.length === 0)
        ? false
        : (l1[0] === l2[0] && listEquals(Array.drop(1)(l1))(Array.drop(1)(l2)));


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("LexerConfiguration")([
        Unit.Test("'use core:Native.Data.List:1.0.0 import List as L'")(Assertion
            .isTrue(listEquals(LexerConfiguration.fromString("use core:Native.Data.List:1.0.0 import List as L").map(x => x.token().value).takeAsArray(6))(["use", "core:Native.Data.List:1.0.0", "import", "List", "as", "L"]))
            .isTrue(listEquals(LexerConfiguration.fromString("use core:Native.Data.List:1.0.0 import List as L").map(x => x.token().id).takeAsArray(6))([Tokens.USE, Tokens.importReference, Tokens.IMPORT, Tokens.upperID, Tokens.AS, Tokens.upperID])))
    ])
]);