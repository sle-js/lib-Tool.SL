const AST = require("./AST");
const C = require("./ParseCombinators");
const Tokens = require("./Tokens");


// type ParseError :: Errors
// type Parser b :: Stream Lexer -> Result ParseError { lexer :: Stream Lexer, result :: b }

parseModule =
    C.and([
        C.many(parseImport),
        C.manyOne(parseDeclaration)
    ]);


// parseId :: Parser AST.Import
function parseImport(lexer) {
    return C.andMap([
        C.token(Tokens.USE),
        tokenValue(Tokens.importReference),
        C.optional(C.andMap([
            C.token(Tokens.AS),
            parseId
        ])(a => a[1]))
    ])(a => a[2].isJust()
        ? AST.QualifiedImport({urn: a[1], name: a[2].content[1]})
        : AST.UnqualifiedImport({urn: a[1]}))(lexer);
}


// parseId :: Parser String
function parseId(lexer) {
    return C.or([
        tokenValue(Tokens.upperID),
        tokenValue(Tokens.lowerID)
    ])(lexer);
}


function parseDeclaration(x) {
    return x;
}


const tokenValue = token =>
    C.tokenMap(token)(t => t.token().value);


module.exports = {
    parseModule,
    parseId,
    parseImport,
    parseDeclaration
};