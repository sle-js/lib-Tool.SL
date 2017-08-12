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
        C.optional(
            C.or([
                C.andMap([
                    C.token(Tokens.AS),
                    parseId])(s => urn => AST.QualifiedImport({urn: urn, name: s[1]})),
                C.andMap([
                    C.token(Tokens.IMPORT),
                    C.or([
                        C.andMap([
                            parseId,
                            C.optional(
                                C.andMap([
                                    C.token(Tokens.AS),
                                    parseId
                                ])(a => a[1]))
                        ])(a => urn => AST.QualifiedNameImport({urn: urn, names: [{name: a[0], qualified: a[1]}]})),
                        C.andMap([
                            C.token(Tokens.LPAREN),
                            C.chainl1(
                                C.andMap([
                                    parseId,
                                    C.optional(
                                        C.andMap([
                                            C.token(Tokens.AS),
                                            parseId
                                        ])(a => a[1]))
                                ])(a => ({name: a[0], qualified: a[1]})))(C.token(Tokens.COMMA)),
                            C.token(Tokens.RPAREN)
                        ])(a => urn => AST.QualifiedNameImport({urn: urn, names: a[1]}))
                    ])
                ])(a => a[1])
            ]))
    ])(a => a[2].isJust()
        ? a[2].content[1](a[1])
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


function parseTypeReference2(lexer) {
    return C.tokenMap(Tokens.upperID)(t => {
        if (t.token().value === "Int") {
            return AST.Int;
        } else if (t.token().value === "String") {
            return AST.String;
        } else if (t.token().value === "Bool") {
            return AST.Bool;
        } else if (t.token().value === "Char") {
            return AST.Char;
        }
    })(lexer);
}


const tokenValue = token =>
    C.tokenMap(token)(t => t.token().value);


module.exports = {
    parseDeclaration,
    parseId,
    parseImport,
    parseModule,
    parseTypeReference2
};