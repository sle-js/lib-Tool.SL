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


    const tokenName = token =>
        tokenMap(token)(t => SLAST.Name(locationAt(t), t.token().value));


    const or = expectedTokens =>
        C.or(expectedTokensError(expectedTokens));


    const conditionMap = tokens => condition =>
        C.map(C.condition(expectedTokensError(tokens))(condition));


    const parseModule = lexer =>
        token(Tokens.eof)(lexer);

    const parseDeclaration = lexer =>
        C.andMap([
            tokenName(Tokens.lowerID),
            token(Tokens.EQUAL),
            parseExpression
        ])(r => SLAST.NameDeclaration(stretchSourceLocation(r[0].loc)(r[2].loc), r[0], r[2]))(lexer);

    const parseExpression = lexer =>
        parseIfExpression(lexer);


    const parseIfExpression = lexer =>
        or([Tokens.If, Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.andMap([
                C.backtrack(token(Tokens.IF)),
                parseLambdaExpression,
                token(Tokens.THEN),
                parseLambdaExpression,
                token(Tokens.ELSE),
                parseLambdaExpression
            ])(r => SLAST.If(stretchSourceLocation(locationAt(r[0]))(r[5].loc), r[1], r[3], r[5])),
            parseLambdaExpression
        ])(lexer);

    const parseLambdaExpression = lexer =>
        or([Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.andMap([
                C.backtrack(C.andMap([
                    C.many1(C.backtrack(tokenName(Tokens.lowerID))),
                    token(Tokens.MINUS_GREATER)
                ])(r => r[0])),
                parseBooleanOrExpression
            ])(r => SLAST.Lambda(stretchSourceLocation(locationFromNodes(r[0]).withDefault(r[0][0].loc))(r[1].loc), r[0], r[1])),
            parseBooleanOrExpression
        ])(lexer);


    const parseBooleanOrExpression = lexer =>
        C.andMap([
            parseRelationalOpExpression,
            C.many(C.and([
                C.backtrack(tokenName(Tokens.BAR_BAR)),
                parseRelationalOpExpression
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseBooleanAndExpression = lexer =>
        C.andMap([
            parseRelationalOpExpression,
            C.many(C.and([
                C.backtrack(tokenName(Tokens.AMPERSAND_AMPERSAND)),
                parseRelationalOpExpression
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseRelationalOpExpression = lexer =>
        C.andMap([
            parseAdditiveExpression,
            C.many(C.and([
                C.backtrack(or([Tokens.EQUAL_EQUAL, Tokens.BANG_EQUAL, Tokens.LESS, Tokens.LESS_EQUAL, Tokens.GREATER, Tokens.GREATER_EQUAL])([
                    C.backtrack(tokenName(Tokens.EQUAL_EQUAL)),
                    C.backtrack(tokenName(Tokens.BANG_EQUAL)),
                    C.backtrack(tokenName(Tokens.LESS)),
                    C.backtrack(tokenName(Tokens.LESS_EQUAL)),
                    C.backtrack(tokenName(Tokens.GREATER)),
                    C.backtrack(tokenName(Tokens.GREATER_EQUAL))
                ])),
                parseAdditiveExpression
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseAdditiveExpression = lexer =>
        C.andMap([
            parseMultiplicativeExpression,
            C.many(C.and([
                C.backtrack(or([Tokens.STAR, Tokens.SLASH])([
                    C.backtrack(tokenName(Tokens.PLUS)),
                    tokenName(Tokens.MINUS)
                ])),
                parseMultiplicativeExpression
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseMultiplicativeExpression = lexer =>
        C.andMap([
            parseFunctionalApplicationExpression,
            C.many(C.and([
                C.backtrack(or([Tokens.STAR, Tokens.SLASH])([
                    C.backtrack(tokenName(Tokens.STAR)),
                    tokenName(Tokens.SLASH)
                ])),
                parseFunctionalApplicationExpression
            ]))
        ])(r => Array.foldl(r[0])(left => item => SLAST.Binary(stretchSourceLocation(left.loc)(item[1].loc), item[0], left, item[1]))(r[1]))(lexer);


    const parseFunctionalApplicationExpression = lexer =>
        C.many1Map(C.backtrack(parseTerminalExpression))(
            r => Array.foldl(r[0])(operator => operand => SLAST.Apply(stretchSourceLocation(operator.loc)(operand.loc), operator, operand))(Array.drop(1)(r))
        )(lexer);


    const parseTerminalExpression = lexer =>
        or([Tokens.constantInteger, Tokens.TRUE, Tokens.FALSE, Tokens.constantString, Tokens.BANG, Tokens.MINUS, Tokens.lowerID, Tokens.LPAREN])([
            C.backtrack(tokenMap(Tokens.constantInteger)(t => SLAST.ConstantInteger(locationAt(t), t.token().value))),
            C.backtrack(tokenMap(Tokens.TRUE)(t => SLAST.ConstantBoolean(locationAt(t), true))),
            C.backtrack(tokenMap(Tokens.FALSE)(t => SLAST.ConstantBoolean(locationAt(t), false))),
            C.backtrack(tokenMap(Tokens.constantString)(t => SLAST.ConstantString(locationAt(t), t.token().value))),
            C.andMap([
                C.backtrack(token(Tokens.BANG)),
                parseExpression
            ])(t => SLAST.Not(stretchSourceLocation(locationAt(t[0]))(t[1]), t[1])),
            C.backtrack(tokenMap(Tokens.lowerID)(t => SLAST.LowerIDReference(locationAt(t), t.token().value))),
            C.andMap([
                C.backtrack(token(Tokens.LPAREN)),
                parseExpression,
                token(Tokens.RPAREN)
            ])(t => t[1])
        ])(lexer);


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