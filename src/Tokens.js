let runner = -1;
nextToken = () => {
    const value = runner;
    runner += 1;
    return value;
};

const err = nextToken();
const eof = nextToken();

const constantChar = nextToken();
const constantFloat = nextToken();
const constantInteger = nextToken();
const constantString = nextToken();

const importReference = nextToken();

const AMPERSAND = nextToken();
const AMPERSAND_AMPERSAND = nextToken();
const BACKSLASH = nextToken();
const BANG_EQUAL = nextToken();
const BAR = nextToken();
const BAR_BAR = nextToken();
const BAR_GREATER = nextToken();
const COLON_COLON = nextToken();
const COMMA = nextToken();
const EQUAL = nextToken();
const EQUAL_EQUAL = nextToken();
const EQUAL_GREATER = nextToken();
const GREATER = nextToken();
const GREATER_EQUAL = nextToken();
const LCURLY = nextToken();
const LESS = nextToken();
const LESS_EQUAL = nextToken();
const LESS_BAR = nextToken();
const LPAREN = nextToken();
const LPAREN_RPAREN = nextToken();
const MINUS = nextToken();
const MINUS_GREATER = nextToken();
const O = nextToken();
const PLUS = nextToken();
const RCURLY = nextToken();
const RPAREN = nextToken();
const SLASH = nextToken();
const STAR = nextToken();

const upperID = nextToken();
const lowerID = nextToken();

const AS = nextToken();
const BOOL = nextToken();
const CASE = nextToken();
const CHAR = nextToken();
const DATA = nextToken();
const ELSE = nextToken();
const FALSE = nextToken();
const IF = nextToken();
const IMPORT = nextToken();
const IN = nextToken();
const INT = nextToken();
const LET = nextToken();
const OF = nextToken();
const PERIOD = nextToken();
const SELF = nextToken();
const STRING = nextToken();
const THEN = nextToken();
const TRUE = nextToken();
const TYPE = nextToken();
const USE = nextToken();
const WHERE = nextToken();


const names = {};

names[err] = "error";
names[eof] = "end-of-file";
names[constantChar] = "constant character";
names[constantFloat] = "constant float";
names[constantInteger] = "constant integer";
names[constantString] = "constant string";
names[importReference] = "import reference";
names[AMPERSAND] = "&";
names[AMPERSAND_AMPERSAND] = "&&";
names[BACKSLASH] = "\\";
names[BANG_EQUAL] = "!=";
names[BAR] = "|";
names[BAR_BAR] = "||";
names[BAR_GREATER] = "|>";
names[COLON_COLON] = "::";
names[COMMA] = ",";
names[EQUAL] = "=";
names[EQUAL_EQUAL] = "==";
names[EQUAL_GREATER] = "=>";
names[GREATER] = ">";
names[GREATER_EQUAL] = ">=";
names[LCURLY] = "{";
names[LESS] = "<";
names[LESS_EQUAL] = "<=";
names[LESS_BAR] = "<|";
names[LPAREN] = "(";
names[LPAREN_RPAREN] = "()";
names[MINUS] = "-";
names[MINUS_GREATER] = "->";
names[O] = "";
names[PLUS] = "+";
names[RCURLY] = "}";
names[RPAREN] = "}";
names[SLASH] = "/";
names[STAR] = "*";
names[upperID] = "identifier starting with upper case";
names[lowerID] = "identifier starting with lower case";
names[AS] = "as";
names[BOOL] = "Bool";
names[CASE] = "case";
names[CHAR] = "Char";
names[DATA] = "data";
names[ELSE] = "else";
names[FALSE] = "false";
names[IF] = "if";
names[IMPORT] = "import";
names[IN] = "in";
names[INT] = "Int";
names[LET] = "let";
names[OF] = "of";
names[PERIOD] = ".";
names[SELF] = "self";
names[STRING] = "String";
names[THEN] = "then";
names[TRUE] = "true";
names[TYPE] = "type";
names[USE] = "use";
names[WHERE] = "where";


module.exports = {
    names,

    err,
    eof,
    constantChar,
    constantFloat,
    constantInteger,
    constantString,
    importReference,
    AMPERSAND,
    AMPERSAND_AMPERSAND,
    BACKSLASH,
    BANG_EQUAL,
    BAR,
    BAR_BAR,
    BAR_GREATER,
    COLON_COLON,
    COMMA,
    EQUAL,
    EQUAL_EQUAL,
    EQUAL_GREATER,
    GREATER,
    GREATER_EQUAL,
    LCURLY,
    LESS,
    LESS_EQUAL,
    LESS_BAR,
    LPAREN,
    LPAREN_RPAREN,
    MINUS,
    MINUS_GREATER,
    O,
    PLUS,
    RCURLY,
    RPAREN,
    SLASH,
    STAR,
    upperID,
    lowerID,
    AS,
    BOOL,
    CASE,
    CHAR,
    DATA,
    ELSE,
    FALSE,
    IF,
    IMPORT,
    IN,
    INT,
    LET,
    OF,
    PERIOD,
    SELF,
    STRING,
    THEN,
    TRUE,
    TYPE,
    USE,
    WHERE
};