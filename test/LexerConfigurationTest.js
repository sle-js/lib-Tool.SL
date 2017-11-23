module.exports = $import(
    "./Libs"
).then($imports => {
    const Array = $imports.Array;
    const Assertion = $imports.Assertion;
    const Unit = $imports.Unit;

    const Tokens = $imports.Tokens;
    const LexerConfiguration = $imports.LexerConfiguration;


    const listEquals = l1 => l2 =>
        (l1.length === 0 && l2.length === 0)
            ? true
            : (l1.length === 0 || l2.length === 0)
            ? false
            : (l1[0] === l2[0] && listEquals(Array.drop(1)(l1))(Array.drop(1)(l2)));


    return Unit.Suite("LexerConfiguration")([
        Unit.Test("hello")(Assertion
            .equals(LexerConfiguration.fromString("hello").head().token().id)(Tokens.lowerID)),
        Unit.Test("Hello")(Assertion
            .equals(LexerConfiguration.fromString("Hello").head().token().id)(Tokens.upperID)),
        Unit.Test("'use core:Native.Data.List:1.0.0 import List as L'")(Assertion
            .isTrue(listEquals(LexerConfiguration.fromString("use core:Native.Data.List:1.0.0 import List as L").map(x => x.token().value).map(t => t.toString()).takeAsArray(6))(["use", "core,Native.Data.List,1.0.0", "import", "List", "as", "L"]))
            .isTrue(listEquals(LexerConfiguration.fromString("use core:Native.Data.List:1.0.0 import List as L").map(x => x.token().id).takeAsArray(6))([Tokens.USE, Tokens.importReference, Tokens.IMPORT, Tokens.upperID, Tokens.AS, Tokens.upperID])))
    ]);
});
