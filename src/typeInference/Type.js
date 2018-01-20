module.exports = $importAll([
    "./../Libs"
]).then($imports => {
    const Variable = name =>
        [0, name];


    const Constant = name =>
        [1, name];


    const Function = domain => range =>
        [2, domain, range];


    const isVariable = type =>
        type[0] === 0;


    const isConstant = type =>
        type[1] === 1;


    const isFunction = type =>
        type[0] === 2;


    const ConstantInt =
        Constant("Int");


    const ConstantBool =
        Constant("Bool");


    const ConstantString =
        Constant("String");


    return {
        isConstant,
        isFunction,
        isVariable,
        Constant,
        Function,
        Variable,
        ConstantBool,
        ConstantInt,
        ConstantString
    };
});
