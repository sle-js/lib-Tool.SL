const Array = require("./Libs").Array;
const AST = require("./AST");
const C = require("./ParseCombinators");
const Tokens = require("./Tokens");


// type ParseError :: Errors
// type Parser b :: Stream Lexer -> Result ParseError { lexer :: Stream Lexer, result :: b }

parseModule =
    C.and([
        C.many(parseImport),
        C.many1(parseDeclaration)
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


function parseTypeDeclaration(lexer) {
    return C.andMap([
        C.token(Tokens.TYPE),
        tokenValue(Tokens.upperID),
        C.many(tokenValue(Tokens.lowerID)),
        C.token(Tokens.EQUAL),
        parseType
    ])(a => AST.TypeDeclaration(a[1])(a[2])(a[4]))(lexer);
}


function parseType(lexer) {
    return parseTypeReference(lexer);
}


function parseTypeReference(lexer) {
    const createASTFunction = typeReferences => {
        const typeReferencesLength =
            Array.length(typeReferences);

        const lastTypeReference =
            typeReferences[typeReferencesLength - 1];

        const butLastTypeReferences =
            Array.slice(0)(typeReferencesLength - 1)(typeReferences);

        return Array.foldr(lastTypeReference)(AST.Function)(butLastTypeReferences);
    };

    return C.chainl1Map(parseTypeReference1)(C.token(Tokens.MINUS_GREATER))(createASTFunction)(lexer);
}


const parseTypeReference1 =
    C.chainl1Map(parseTypeReference2)(C.token(Tokens.STAR))(a => Array.length(a) === 1 ? a[0] : AST.NTuple(a));


function parseTypeReference2(lexer) {
    return C.or([
        C.andMap([
            tokenValue(Tokens.upperID),
            C.many1(parseTypeReference3)
        ])(a => AST.DataReference(a[0])(a[1])),
        parseTypeReference3
    ])(lexer);
}


function parseTypeReference3(lexer) {
    return C.or([
        C.andMap([
            tokenValue(Tokens.upperID)
        ])(a => {
            if (a[0] === "Int") {
                return AST.Int;
            } else if (a[0] === "String") {
                return AST.String;
            } else if (a[0] === "Bool") {
                return AST.Bool;
            } else if (a[0] === "Char") {
                return AST.Char;
            } else if (a[0] === "Self") {
                return AST.Self;
            } else {
                return AST.DataReference(a[0])([]);
            }
        }),
        C.tokenMap(Tokens.lowerID)(t => AST.Reference(t.token().value)),
        C.tokenMap(Tokens.LPAREN_RPAREN)(_ => AST.Unit),
        C.andMap([
            C.token(Tokens.LPAREN),
            parseTypeReference,
            C.token(Tokens.RPAREN)
        ])(a => a[1])
    ])(lexer);
}


const tokenValue = token =>
    C.tokenMap(token)(t => t.token().value);


module.exports = {
    parseDeclaration,
    parseId,
    parseImport,
    parseModule,
    parseTypeDeclaration,
    parseTypeReference,
    parseTypeReference1,
    parseTypeReference2,
    parseTypeReference3
};