const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const okayResult = lexer => result =>
    Result.Okay({lexer: lexer, result: result});


const mapResult = f => result =>
    result.map(r => ({lexer: r.lexer, result: f(r.result)}));


const resultThen = currentResult => parser =>
    currentResult.andThen(s => mapResult(r => Array.append(r)(s.result))(parser(s.lexer)));


const and = parsers => lexer =>
    Array.foldl(okayResult(lexer)([]))(resultThen)(parsers);


const andMap = parsers => f => lexer =>
    mapResult(f)(and(parsers)(lexer));


const manyResult = currentResult => parser => {
    const nextResult =
        resultThen(currentResult)(parser);

    return nextResult.isOkay()
        ? manyResult(nextResult)(parser)
        : currentResult;
};


const many = parser => lexer =>
    manyResult(okayResult(lexer)([]))(parser);


const many1 = parser => lexer =>
    manyResult(mapResult(r => [r])(parser(lexer)))(parser);


const or = parsers => lexer => {
    const parseOption = parser => {
        const optionResult = parser(lexer);

        return optionResult.isOkay()
            ? Maybe.Just(optionResult)
            : Maybe.Nothing;
    };

    return Array.findMap(parseOption)(parsers).withDefault(Result.Error(Errors.orFailed(lexer.head())));
};


const chainl1 = parser => sep => lexer => {
    const initialResult =
        mapResult(r => [r])(parser(lexer));

    const tailParser =
        andMap([sep, parser])(a => a[1]);

    if (initialResult.isOkay()) {
        return manyResult(initialResult)(tailParser);
    } else {
        return initialResult;
    }
};


const token = tokenID => lexer =>
    lexer.head().token().id === tokenID
        ? okayResult(lexer.tail())(lexer.head())
        : Result.Error(Errors.tokenExpected(lexer.head())(tokenID));


const tokenMap = tokenID => f => lexer =>
    mapResult(f)(token(tokenID)(lexer));


const optional = parser => lexer => {
    const result = parser(lexer);

    return result.isOkay()
        ? mapResult(Maybe.Just)(result)
        : okayResult(lexer)(Maybe.Nothing);
};


module.exports = {
    and,
    andMap,
    chainl1,
    many,
    many1,
    optional,
    or,
    token,
    tokenMap
};