// type alias Infer x = Promise Error (x, InferState)
//
// type alias InferState = {
//      variableCounter: Int
// }


module.exports = $importAll([]).then($imports => {
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


    const variableNameFromInt = value =>
        (value < 11) ? String.fromCharCode(value + 80)
            : value < 25 ? String.fromCharCode(value + 54)
            : "T" + (value - 24);
    assumptionEqual(variableNameFromInt(0), "P");
    assumptionEqual(variableNameFromInt(10), "Z");
    assumptionEqual(variableNameFromInt(11), "A");
    assumptionEqual(variableNameFromInt(24), "N");
    assumptionEqual(variableNameFromInt(25), "T1");
    assumptionEqual(variableNameFromInt(26), "T2");


    const freshVariable = infer =>
        Promise.resolve([
            variableNameFromInt(infer.variableCounter),
            Object.assign({}, infer, {
                variableCounter: infer.variableCounter + 1
            })]);


    const initialInferState = {
        variableCounter: 0
    };


    return {
        freshVariable,
        initialInferState,
        isTypeConstant,
        isTypeFunction,
        isTypeVariable,
        typeBool,
        typeInt,
        typeString,
        TypeConstant,
        TypeFunction,
        TypeVariable
    };
});
