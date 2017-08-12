const Maybe = require("./Libs").Maybe;


function Regex(regex) {
    this.regex = regex;
}


function from(regex) {
    return new Regex(regex);
}


Regex.prototype.matchFrom = function (input) {
    return index => {
        this.regex.lastIndex = index;
        const matchedRegex = this.regex.exec(input);
        if (matchedRegex) {
            return Maybe.Just(matchedRegex[0]);
        } else {
            return Maybe.Nothing;
        }
    }
};
assumption(from(/a+/iy).matchFrom("aaab")(0).withDefault("") === "aaa");
assumption(from(/a+/iy).matchFrom("aaab")(1).withDefault("") === "aa");
assumption(from(/a+/iy).matchFrom("aaab")(3).withDefault("") === "");
assumption(from(/[a-z]+/y).matchFrom("--Hello--")(2).withDefault("") === "");
assumption(from(/[a-z]+/y).matchFrom("--hello--")(2).withDefault("") === "hello");


module.exports = {
    from
};