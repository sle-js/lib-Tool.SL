module.exports = $importAll([
    "./../Libs"
]).then($imports => {
    const TypeVariable = name =>
        [0, name];


    const TypeConstant = name =>
        [1, name];


    const TypeFunction = domain => range =>
        [2, domain, range];


    const isTypeVariable = type =>
        type[0] === 0;


    const isTypeConstant = type =>
        type[1] === 1;


    const isTypeFunction = type =>
        type[0] === 2;


    const typeInt =
        TypeConstant("Int");


    const typeBool =
        TypeConstant("Bool");


    const typeString =
        TypeConstant("String");


    return {
        isTypeConstant,
        isTypeFunction,
        isTypeVariable,
        TypeConstant,
        TypeFunction,
        TypeVariable
    };
});
