module.exports = $importAll([
    "./Libs",
    "./AST",
    "./ParseCombinators",
    "./Tokens"
]).then($imports => {
    const Array = $imports[0].Array;
    const AST = $imports[1];
    const C = $imports[0].ParserCombinator;
    const Errors = $imports[0].Errors;
    const OC = $imports[2];
    const SLAST = $imports[0].SLAST;
    const Tokens = $imports[3];


    const errorLocation = token =>
        Errors.LocationPosition(token.state.source.withDefault(""), Errors.Position(transformColumn(token.position()[1]), transformRow(token.position()[0])));


    const expectedTokensError = tokenIDs => token => {
        const foundToken = token => ({
            id: token.id,
            symbol: Tokens.names[token.id],
            value: token.value
        });

        const expectedTokens = Array.map(tokenID => ({
            id: tokenID,
            symbol: Tokens.names[tokenID]
        }))(tokenIDs);

        return Errors.ExpectedTokens(errorLocation(token), foundToken(token.state.token), expectedTokens);
    };


    const expectedTokenError = tokenID =>
        expectedTokensError([tokenID]);


    const token = t =>
        C.token(expectedTokenError(t))(t);


    const tokenMap = t =>
        C.tokenMap(expectedTokenError(t))(t);


    const or = expectedTokens =>
        C.or(expectedTokensError(expectedTokens));


    // type ParseError :: Errors
    // type Parser b :: Stream Lexer -> Result ParseError { lexer :: Stream Lexer, result :: b }

    const parseModule = lexer =>
        OC.andMap([
            OC.many(parseImport),
            OC.many(parseDeclaration),
            OC.token(Tokens.eof)
        ])(a => AST.Module(a[0])(a[1]))(lexer);


    // parseId :: Parser AST.Import
    function parseImport(lexer) {
        return OC.andMap([
            OC.token(Tokens.USE),
            tokenValue(Tokens.importReference),
            OC.optional(
                OC.or([
                    OC.andMap([
                        OC.token(Tokens.AS),
                        parseId,
                        OC.optional(OC.token(Tokens.MINUS))
                    ])(s => urn => AST.QualifiedImport({urn: urn, name: s[1], public: s[2].isNothing()})),
                    OC.andMap([
                        OC.token(Tokens.IMPORT),
                        OC.or([
                            OC.andMap([
                                parseId,
                                OC.optional(
                                    OC.andMap([
                                        OC.token(Tokens.AS),
                                        parseId
                                    ])(a => a[1])),
                                OC.optional(OC.token(Tokens.MINUS))
                            ])(a => urn => AST.QualifiedNameImport({
                                urn: urn,
                                names: [{name: a[0], qualified: a[1].withDefault(a[0]), public: a[2].isNothing()}]
                            })),
                            OC.andMap([
                                OC.token(Tokens.LPAREN),
                                OC.chainl1(
                                    OC.andMap([
                                        parseId,
                                        OC.optional(
                                            OC.andMap([
                                                OC.token(Tokens.AS),
                                                parseId
                                            ])(a => a[1])),
                                        OC.optional(OC.token(Tokens.MINUS))
                                    ])(a => ({
                                        name: a[0],
                                        qualified: a[1].withDefault(a[0]),
                                        public: a[2].isNothing()
                                    })))(OC.token(Tokens.COMMA)),
                                OC.token(Tokens.RPAREN)
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
        return OC.or([
            tokenValue(Tokens.upperID),
            tokenValue(Tokens.lowerID)
        ])(lexer);
    }


    function parseDeclaration(lexer) {
        return OC.or([
            parseTypeDeclaration,
            parseDataDeclaration,
            parseNameSignatureDeclaration,
            parseNameDeclaration
        ])(lexer);
    }


    function parseNameSignatureDeclaration(lexer) {
        return OC.andMap([
            parseName,
            OC.token(Tokens.COLON_COLON),
            parseType
        ])(a => AST.NameSignatureDeclaration(a[0])(a[2]))(lexer);
    }


    const parseNameDeclaration = lexer =>
        C.andMap([
            C.backtrack(parseName),
            C.many(C.backtrack(or([Tokens.lowerID, Tokens.LPAREN_RPAREN])([
                C.backtrack(tokenMap(Tokens.lowerID)(t => SLAST.Argument(locationAt(t), t.token().value))),
                C.backtrack(tokenMap(Tokens.LPAREN_RPAREN)(t => SLAST.Argument(locationAt(t), "()")))
            ]))),
            C.token(expectedTokensError([Tokens.lowerID, Tokens.LPAREN_RPAREN, Tokens.EQUAL]))(Tokens.EQUAL),
            parseExpression
        ])(a => SLAST.NameDeclaration(stretchSourceLocation(a[0].loc)(a[3].loc), a[0], a[1], a[3]))(lexer);


    const parseName = lexer =>
        or([Tokens.lowerID, Tokens.LPAREN])([
            C.backtrack(tokenMap(Tokens.lowerID)(t => SLAST.Name(locationAt(t), t.token().value))),
            C.andMap([
                C.backtrack(token(Tokens.LPAREN)),
                parseOperatorName,
                token(Tokens.RPAREN)
            ])(a => SLAST.Name(stretchSourceLocation(locationAt(a[0]))(locationAt(a[2])), "(" + a[1] + ")"))
        ])(lexer);


    const parseOperatorName = lexer =>
        or([Tokens.PLUS, Tokens.MINUS, Tokens.STAR, Tokens.SLASH, Tokens.EQUAL_EQUAL, Tokens.BANG_EQUAL, Tokens.LESS, Tokens.LESS_EQUAL, Tokens.GREATER, Tokens.GREATER_EQUAL, Tokens.BAR_BAR, Tokens.AMPERSAND_AMPERSAND])([
            C.backtrack(tokenValue(Tokens.PLUS)),
            C.backtrack(tokenValue(Tokens.MINUS)),
            C.backtrack(tokenValue(Tokens.STAR)),
            C.backtrack(tokenValue(Tokens.SLASH)),
            C.backtrack(tokenValue(Tokens.EQUAL_EQUAL)),
            C.backtrack(tokenValue(Tokens.BANG_EQUAL)),
            C.backtrack(tokenValue(Tokens.LESS)),
            C.backtrack(tokenValue(Tokens.LESS_EQUAL)),
            C.backtrack(tokenValue(Tokens.GREATER)),
            C.backtrack(tokenValue(Tokens.GREATER_EQUAL)),
            C.backtrack(tokenValue(Tokens.BAR_BAR)),
            C.backtrack(tokenValue(Tokens.AMPERSAND_AMPERSAND))
        ])(lexer);


    const parseExpression = lexer =>
        parseLetExpression(lexer);


    const parseLetExpression = lexer =>
        parseWhereExpression(lexer);


    const parseWhereExpression = lexer =>
        parseCaseExpression(lexer);


    const parseCaseExpression = lexer =>
        parsePipeExpression(lexer);


    const parsePipeExpression = lexer =>
        parseCompositionExpression(lexer);


    const parseCompositionExpression = lexer =>
        parseLambdaExpression(lexer);


    const parseLambdaExpression = lexer =>
        parseObjectCompositionExpression(lexer);


    const parseObjectCompositionExpression = lexer =>
        parseOrExpression(lexer);


    const parseOrExpression = lexer =>
        parseAndExpression(lexer);


    const parseAndExpression = lexer =>
        parseRelationalExpression(lexer);


    const parseRelationalExpression = lexer =>
        parseAdditiveExpression(lexer);


    const parseAdditiveExpression = lexer =>
        parseMultiplicativeExpression(lexer);


    const parseMultiplicativeExpression = lexer =>
        parseApplicationExpression(lexer);


    const parseApplicationExpression = lexer =>
        parseReferenceExpression(lexer);


    const parseReferenceExpression = lexer =>
        parseSimpleExpression(lexer);


    const parseSimpleExpression =
        tokenMap(Tokens.constantInteger)(t => SLAST.ConstantNumber(locationAt(t), t.token().value));


    function parseTypeDeclaration(lexer) {
        return OC.andMap([
            OC.token(Tokens.TYPE),
            tokenValue(Tokens.upperID),
            OC.many(tokenValue(Tokens.lowerID)),
            OC.token(Tokens.EQUAL),
            parseType
        ])(a => AST.TypeDeclaration(a[1])(a[2])(a[4]))(lexer);
    }


    function parseType(lexer) {
        return OC.andMap([
            OC.optional(OC.andMap([
                parseTypeConstraints,
                OC.token(Tokens.EQUAL_GREATER)
            ])(a => a[0])),
            parseTypeReferences
        ])(a => AST.Type(a[0].withDefault([]))(a[1]))(lexer);
    }


    function parseTypeReferences(lexer) {
        return OC.chainl1Map(parseTypeReference)(OC.token(Tokens.AMPERSAND))(a =>
            Array.length(a) === 1
                ? AST.ReferencedType(a[0])
                : AST.ComposedType(a))(lexer);
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

        return OC.chainl1Map(parseTypeReference1)(OC.token(Tokens.MINUS_GREATER))(createASTFunction)(lexer);
    }


    const parseTypeReference1 =
        OC.chainl1Map(parseTypeReference2)(OC.token(Tokens.STAR))(a => Array.length(a) === 1 ? a[0] : AST.NTuple(a));


    function parseTypeReference2(lexer) {
        return OC.or([
            OC.andMap([
                tokenValue(Tokens.upperID),
                OC.many1(parseTypeReference3)
            ])(a => AST.DataReference(a[0])(a[1])),
            parseTypeReference3
        ])(lexer);
    }


    function parseTypeReference3(lexer) {
        return OC.or([
            tokenMap(Tokens.upperID)(t => {
                const tokenValue = t.token().value;

                if (tokenValue === "Int") {
                    return SLAST.IntTypeReference(locationAt(t));
                } else if (tokenValue === "String") {
                    return SLAST.StringTypeReference(locationAt(t));
                } else if (tokenValue === "Bool") {
                    return SLAST.BoolTypeReference(locationAt(t));
                } else if (tokenValue === "Char") {
                    return SLAST.CharTypeReference(locationAt(t));
                } else if (tokenValue === "Self") {
                    return SLAST.SelfTypeReference(locationAt(t));
                } else {
                    return AST.DataReference(tokenValue)([]);
                }
            }),
            OC.tokenMap(Tokens.lowerID)(t => AST.Reference(t.token().value)),
            tokenMap(Tokens.LPAREN_RPAREN)(t => SLAST.UnitTypeReference(locationAt(t))),
            OC.andMap([
                OC.token(Tokens.LPAREN),
                parseTypeReference,
                OC.token(Tokens.RPAREN)
            ])(a => a[1])
        ])(lexer);
    }


    function parseTypeConstraint(lexer) {
        return OC.andMap([
            OC.or([
                tokenValue(Tokens.lowerID),
                OC.conditionMap(t => t.token().id === Tokens.upperID && t.token().value === "Self")(_ => "Self")
            ]),
            OC.token(Tokens.COLON_COLON),
            parseTypeReferences
        ])(a => AST.TypeConstraint(a[0])(a[2]))(lexer);
    }


    const parseTypeConstraints =
        OC.chainl1(parseTypeConstraint)(OC.token(Tokens.COMMA));


    function parseDataDeclaration(lexer) {
        return OC.andMap([
            OC.token(Tokens.DATA),
            tokenValue(Tokens.upperID),
            OC.many(tokenValue(Tokens.lowerID)),
            OC.token(Tokens.EQUAL),
            OC.optionalMap(
                OC.andMap([
                    parseTypeConstraints,
                    OC.token(Tokens.EQUAL_GREATER)
                ])(a => a[0])
            )(a => a.withDefault([])),
            OC.chainl1(parseConstructor)(OC.token(Tokens.BAR)),
            OC.many(parseDeclaration)
        ])(a => AST.DataDeclaration(a[1])(a[2])(a[4])(a[5])(a[6]))(lexer);
    }


    function parseConstructor(lexer) {
        return OC.andMap([
            tokenValue(Tokens.upperID),
            OC.many(parseTypeReference)
        ])(a => ({name: a[0], typeReferences: a[1]}))(lexer);
    }


    const tokenValue = token =>
        tokenMap(token)(t => t.token().value);


    const transformColumn = column =>
        column;


    const transformRow = row =>
        row - 1;


    const stretchSourceLocation = startLocation => endLocation =>
        SLAST.SourceLocation(startLocation.source, startLocation.start, endLocation.end);


    const locationAt = t =>
        SLAST.SourceLocation(t.source().withDefault(null), positionStart(t), positionEnd(t));


    const positionStart = t =>
        SLAST.Position(transformColumn(t.position()[1]), transformRow(t.position()[0]));


    const positionEnd = t =>
        SLAST.Position(transformColumn(t.position()[3]), transformRow(t.position()[2]));


    return {
        parseDataDeclaration,
        parseDeclaration,
        parseId,
        parseImport,
        parseNameDeclaration,
        parseModule,
        parseOperatorName,
        parseName,
        parseNameSignatureDeclaration,
        parseSimpleExpression,
        parseType,
        parseTypeConstraint,
        parseTypeConstraints,
        parseTypeDeclaration,
        parseTypeReference,
        parseTypeReference1,
        parseTypeReference2,
        parseTypeReference3
    };
});