function ErrorsType(content) {
    this.content = content;
}


const tokenExpected = lexer => token =>
    new ErrorsType([0, lexer, token]);


const orFailed = lexer =>
    new ErrorsType([1, lexer]);


module.exports = {
    tokenExpected,
    orFailed
};