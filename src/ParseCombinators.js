const Errors = require("./Errors");
const Result = require("./Result");


const and = parsers => lexer =>
    lexer;


const many = parsers => lexer =>
    lexer;


const manyOne = parsers => lexer =>
    lexer;


const or = parsers => lexer => {
    for (let lp = 0; lp < parsers.length; lp += 1) {
        const result = parsers[lp](lexer);

        if (result.isOkay()) {
            return result;
        }
    }
    return Result.Error(Errors.orFailed(lexer.head()));
};


const token = tokenID => lexer =>
    lexer.head().token().id === tokenID
        ? Result.Okay({lexer: lexer.tail(), result: lexer.head()})
        : Result.Error(Errors.tokenExpected(lexer.head())(tokenID));


module.exports = {
    and,
    many,
    manyOne,
    or,
    token
};