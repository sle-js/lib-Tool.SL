function ErrorsType(content) {
    this.content = content;
}


const conditionFailed = lexer =>
    new ErrorsType([0, lexer]);


const tokenExpected = lexer => token =>
    new ErrorsType([1, lexer, token]);


const orFailed = lexer =>
    new ErrorsType([2, lexer]);


module.exports = {
    conditionFailed,
    orFailed,
    tokenExpected
};