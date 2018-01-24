module.exports = $importAll([
    "./Libs",
    "./Tokens"
]).then($imports => {
    const Array = $imports[0].Array;
    const C = $imports[0].ParserCombinator;
    const Errors = $imports[0].Errors;
    const Maybe = $imports[0].Maybe;
    const SLAST = $imports[0].SLAST;
    const Tokens = $imports[1];


    const errorLocation = token =>
        Errors.LocationPosition(token.state.source.withDefault(""), Errors.Position(token.position()[1], token.position()[0]));


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


    const tokenName = token =>
        tokenMap(token)(t => SLAST.Name(locationAt(t), t.token().value));


    const or = expectedTokens =>
        C.or(expectedTokensError(expectedTokens));


    const conditionMap = tokens => condition =>
        C.map(C.condition(expectedTokensError(tokens))(condition));


    const parseModule = lexicalConstraint => lexer =>
        C.andMap([
            C.many(parseDeclaration(lexicalConstraint)),
            token(Tokens.eof)
        ])(r =>
            SLAST.Module(stretchSourceLocation(locationFromNodes(r[0]).withDefault(locationAt(r[1])))(locationAt(r[1])), r[0]))(lexer);


    const parseDeclaration = lexicalConstraint => lexer => {
        const x =
            lexer.head().position()[0];

        const lexicalConstraint =
            token => token.position()[0] > x;

        return C.andMap([
            tokenName(Tokens.lowerID),
            token(Tokens.EQUAL),
            parseExpression(lexicalConstraint)
        ])(r => SLAST.NameDeclaration(stretchSourceLocation(r[0].loc)(r[2].loc), r[0], r[2]))(lexer);
    };


    const parseExpression = lexicalConstraint => lexer =>
        parseIfExpression(lexicalConstraint)(lexer);


    const parseIfExpression = lexicalConstraint => lexer =>
        or([Tokens.If, Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.andMap([
                C.backtrack(token(Tokens.IF)),
                parseLambdaExpression(lexicalConstraint),
                token(Tokens.THEN),
                parseLambdaExpression(lexicalConstraint),
                token(Tokens.ELSE),
                parseLambdaExpression(lexicalConstraint)
            ])(r => SLAST.If(stretchSourceLocation(locationAt(r[0]))(r[5].loc), r[1], r[3], r[5])),
            parseLambdaExpression(lexicalConstraint)
        ])(lexer);


    const parseLambdaExpression = lexicalConstraint => lexer =>
        or([Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.andMap([
                C.backtrack(C.andMap([
                    C.many1(C.backtrack(tokenName(Tokens.lowerID))),
                    token(Tokens.MINUS_GREATER)
                ])(r => r[0])),
                parseExpression(lexicalConstraint)
            ])(r => SLAST.Lambda(stretchSourceLocation(locationFromNodes(r[0]).withDefault(r[0][0].loc))(r[1].loc), r[0], r[1])),
            parseBooleanOrExpression(lexicalConstraint)
        ])(lexer);


    const parseBooleanOrExpression = lexicalConstraint => lexer =>
        C.andMap([
            parseRelationalOpExpression(lexicalConstraint),
            C.many(C.and([
                C.backtrack(tokenName(Tokens.BAR_BAR)),
                parseRelationalOpExpression(lexicalConstraint)
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseBooleanAndExpression = lexicalConstraint => lexer =>
        C.andMap([
            parseRelationalOpExpression(lexicalConstraint),
            C.many(C.and([
                C.backtrack(tokenName(Tokens.AMPERSAND_AMPERSAND)),
                parseRelationalOpExpression(lexicalConstraint)
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseRelationalOpExpression = lexicalConstraint => lexer =>
        C.andMap([
            parseAdditiveExpression(lexicalConstraint),
            C.many(C.and([
                C.backtrack(or([Tokens.EQUAL_EQUAL, Tokens.BANG_EQUAL, Tokens.LESS, Tokens.LESS_EQUAL, Tokens.GREATER, Tokens.GREATER_EQUAL])([
                    C.backtrack(tokenName(Tokens.EQUAL_EQUAL)),
                    C.backtrack(tokenName(Tokens.BANG_EQUAL)),
                    C.backtrack(tokenName(Tokens.LESS)),
                    C.backtrack(tokenName(Tokens.LESS_EQUAL)),
                    C.backtrack(tokenName(Tokens.GREATER)),
                    C.backtrack(tokenName(Tokens.GREATER_EQUAL))
                ])),
                parseAdditiveExpression(lexicalConstraint)
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseAdditiveExpression = lexicalConstraint => lexer =>
        C.andMap([
            parseMultiplicativeExpression(lexicalConstraint),
            C.many(C.and([
                C.backtrack(or([Tokens.STAR, Tokens.SLASH])([
                    C.backtrack(tokenName(Tokens.PLUS)),
                    tokenName(Tokens.MINUS)
                ])),
                parseMultiplicativeExpression(lexicalConstraint)
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseMultiplicativeExpression = lexicalConstraint => lexer =>
        C.andMap([
            parseFunctionalApplicationExpression(lexicalConstraint),
            C.many(C.and([
                C.backtrack(or([Tokens.STAR, Tokens.SLASH])([
                    C.backtrack(tokenName(Tokens.STAR)),
                    tokenName(Tokens.SLASH)
                ])),
                parseFunctionalApplicationExpression(lexicalConstraint)
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseFunctionalApplicationExpression = lexicalConstraint => lexer =>
        C.many1Map(C.backtrack(parseTerminalExpression(lexicalConstraint)))(
            r => Array.foldl(r[0])(operator => operand => SLAST.Apply(stretchSourceLocation(operator.loc)(operand.loc), operator, operand))(Array.drop(1)(r))
        )(lexer);


    const parseTerminalExpression = lexicalConstraint => lexer =>
        or([Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.backtrack(tokenMap(Tokens.constantInteger)(t => SLAST.ConstantInteger(locationAt(t), t.token().value))),
            C.backtrack(tokenMap(Tokens.TRUE)(t => SLAST.ConstantBoolean(locationAt(t), true))),
            C.backtrack(tokenMap(Tokens.FALSE)(t => SLAST.ConstantBoolean(locationAt(t), false))),
            C.backtrack(tokenMap(Tokens.constantString)(t => SLAST.ConstantString(locationAt(t), t.token().value))),
            C.andMap([
                C.backtrack(token(Tokens.BANG)),
                parseExpression(lexicalConstraint)
            ])(t => SLAST.Not(stretchSourceLocation(locationAt(t[0]))(t[1]), t[1])),
            C.backtrack(conditionMap([Tokens.lowerID])(t => t.token().id === Tokens.lowerID && lexicalConstraint(t))(t => SLAST.LowerIDReference(locationAt(t), t.token().value))),

            C.andMap([
                C.backtrack(token(Tokens.LPAREN)),
                parseExpression(lexicalConstraint),
                token(Tokens.RPAREN)
            ])(t => t[1])
        ])(lexer);


    const stretchSourceLocation = startLocation => endLocation =>
        SLAST.SourceLocation(startLocation.source, startLocation.start, endLocation.end);


    const locationAt = t =>
        SLAST.SourceLocation(t.source().withDefault(null), positionStart(t), positionEnd(t));


    const positionStart = t =>
        SLAST.Position(t.position()[1], t.position()[0]);


    const positionEnd = t =>
        SLAST.Position(t.position()[3], t.position()[2]);


    const locationFromNodes = nodes =>
        Array.length(nodes) === 0
            ? Maybe.Nothing
            : Maybe.Just(SLAST.SourceLocation(nodes[0].loc.source, nodes[0].loc.start, nodes[nodes.length - 1].loc.end));


    return {
        parseAdditiveExpression,
        parseBooleanAndExpression,
        parseBooleanOrExpression,
        parseDeclaration,
        parseFunctionalApplicationExpression,
        parseIfExpression,
        parseLambdaExpression,
        parseModule,
        parseMultiplicativeExpression,
        parseRelationalOpExpression,
        parseTerminalExpression
    };
});