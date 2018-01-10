let runner = -1;
nextToken = () => {
    const value = runner;
    runner += 1;
    return value;
};

const err = nextToken();
const eof = nextToken();

const constantInteger = nextToken();
const constantString = nextToken();

const importReference = nextToken();

const AMPERSAND_AMPERSAND = nextToken();
const BANG_EQUAL = nextToken();
const BAR_BAR = nextToken();
const EQUAL = nextToken();
const EQUAL_EQUAL = nextToken();
const GREATER = nextToken();
const GREATER_EQUAL = nextToken();
const LESS = nextToken();
const LESS_EQUAL = nextToken();
const LPAREN = nextToken();
const MINUS = nextToken();
const MINUS_GREATER = nextToken();
const PLUS = nextToken();
const RPAREN = nextToken();
const SLASH = nextToken();
const STAR = nextToken();

const upperID = nextToken();
const lowerID = nextToken();

const ELSE = nextToken();
const FALSE = nextToken();
const IF = nextToken();
const THEN = nextToken();
const TRUE = nextToken();


const names = {};

names[err] = "error";
names[eof] = "end-of-file";
names[constantInteger] = "constant integer";
names[constantString] = "constant string";
names[AMPERSAND_AMPERSAND] = "&&";
names[BANG_EQUAL] = "!=";
names[BAR_BAR] = "||";
names[EQUAL] = "=";
names[EQUAL_EQUAL] = "==";
names[GREATER] = ">";
names[GREATER_EQUAL] = ">=";
names[LESS] = "<";
names[LESS_EQUAL] = "<=";
names[LPAREN] = "(";
names[MINUS] = "-";
names[MINUS_GREATER] = "->";
names[PLUS] = "+";
names[RPAREN] = ")";
names[SLASH] = "/";
names[STAR] = "*";
names[upperID] = "identifier starting with upper case";
names[lowerID] = "identifier starting with lower case";
names[ELSE] = "else";
names[FALSE] = "false";
names[IF] = "if";
names[THEN] = "then";
names[TRUE] = "true";


module.exports = Promise.resolve({
    names,

    err,
    eof,
    constantInteger,
    constantString,
    importReference,
    AMPERSAND_AMPERSAND,
    BANG_EQUAL,
    BAR_BAR,
    EQUAL,
    EQUAL_EQUAL,
    GREATER,
    GREATER_EQUAL,
    LESS,
    LESS_EQUAL,
    MINUS,
    MINUS_GREATER,
    PLUS,
    SLASH,
    STAR,
    upperID,
    lowerID,
    ELSE,
    FALSE,
    IF,
    THEN,
    TRUE
});