const digit$63 = c =>
    (c >= 48) && (c <= 57);


const lowerCaseAlpha$63 = c =>
    (c >= 97) && (c <= 122);


const upperCaseAlpha$63 = c =>
    (c >= 65) && (c <= 90);


const alpha$63 = c =>
    lowerCaseAlpha$63(c) || upperCaseAlpha$63(c);


const alphaDigit$63 = c =>
    alpha$63(c) || digit$63(c);


module.exports = {
    alpha$63,
    alphaDigit$63,
    digit$63,
    lowerCaseAlpha$63,
    upperCaseAlpha$63
};
