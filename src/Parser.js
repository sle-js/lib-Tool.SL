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


    // type ParseError :: Errors
    // type Parser b :: Stream Lexer -> Result ParseError { lexer :: Stream Lexer, result :: b }

    const parseModule = lexer =>
        token(Tokens.eof)(lexer);


    const parseExpression = lexer =>
        parseTerminalExpression(lexer);


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
            C.andMap([
                C.backtrack(token(Tokens.MINUS)),
                parseExpression
            ])(t => SLAST.Negate(stretchSourceLocation(locationAt(t[0]))(t[1]), t[1])),
            C.backtrack(tokenMap(Tokens.lowerID)(t => SLAST.LowerIDReference(locationAt(t), t.token().value))),
            C.andMap([
                C.backtrack(token(Tokens.LPAREN)),
                parseExpression,
                C.backtrack(token(Tokens.RPAREN))
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
        parseModule,
        parseTerminalExpression
    };
});