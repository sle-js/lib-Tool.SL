// type alias Infer x = Promise Error (x, InferState)
//
// type alias InferState = {
//      variableCounter: Int
// }


module.exports = $importAll([]).then($imports => {
    const variableNameFromInt = value => {
        const charToString = n =>
            String.fromCharCode(n);

        return value < 11
            ? charToString(value + 80)
            : value < 25
                ? charToString(value + 54)
                : "T" + (value - 24);
    };
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
        initialInferState
    };
});
