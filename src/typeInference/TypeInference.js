// type alias Infer x = Promise Error (x, InferState)
//
// type alias InferState = {
//      variableCounter: Int
// }


module.exports = $importAll([
    "./../Libs",
    "./Type"
]).then($imports => {
    const Dict = $imports[0].Dict;
    const Type = $imports[1];


    const Schema = names => type =>
        [names, type];


    const initialTypeEnv =
        Dict.empty;


    const extendTypeEnv =
        Dict.insert;


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
        extendTypeEnv,
        freshVariable,
        initialInferState,
        initialTypeEnv,
        Schema
    };
});
