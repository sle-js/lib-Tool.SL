const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const okayResult = lexer => result =>
    Result.Okay({lexer: lexer, result: result});


const mapResult = f => result =>
    result.map(r => ({lexer: r.lexer, result: f(r.result)}));


const andThen = currentResult => parser =>
    currentResult.andThen(s => mapResult(r => Array.append(r)(s.result))(parser(s.lexer)));


const and = parsers => lexer =>
    Array.foldl(okayResult(lexer)([]))(andThen)(parsers);


const andMap = parsers => f => lexer =>
    mapResult(f)(and(parsers)(lexer));


const manyResult = currentResult => parser => {
    const nextResult =
        andThen(currentResult)(parser);

    return nextResult.isOkay()
        ? manyResult(nextResult)(parser)
        : currentResult;
};


const many = parser => lexer =>
    manyResult(okayResult(lexer)([]))(parser);


const many1 = parser => lexer =>
    manyResult(mapResult(r => [r])(parser(lexer)))(parser);


const many1Map = parser => f => lexer =>
    mapResult(f)(many1(parser)(lexer));


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


const chainl1Map = parser => sep => f => lexer =>
    mapResult(f)(chainl1(parser)(sep)(lexer));


const condition = f => lexer =>
    f(lexer.head())
        ? okayResult(lexer.tail())(lexer.head())
        : Result.Error(Errors.conditionFailed(lexer.head()));


const conditionMap = f => map => lexer =>
    mapResult(map)(condition(f)(lexer));


const token = tokenID =>
    condition(h => h.token().id === tokenID);


const tokenMap = tokenID => f => lexer =>
    mapResult(f)(token(tokenID)(lexer));


const optional = parser => lexer => {
    const result = parser(lexer);

    return result.isOkay()
        ? mapResult(Maybe.Just)(result)
        : okayResult(lexer)(Maybe.Nothing);
};


const optionalMap = parser => f => lexer =>
    mapResult(f)(optional(parser)(lexer));


module.exports = {
    and,
    andMap,
    chainl1,
    chainl1Map,
    condition,
    conditionMap,
    many,
    many1,
    many1Map,
    optional,
    optionalMap,
    or,
    token,
    tokenMap
};