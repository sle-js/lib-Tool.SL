module.exports = $importAll([
    "core:Text.Parsing.Combinators:1.1.0"
]).then($imports => {
    const ParserCombinator =
        $imports[0];


    ParserCombinator.chainl1 = parser => lexer =>
        ParserCombinator.chainl1Map(parser)(lexer)(_ => _);


    return ParserCombinator;
});


