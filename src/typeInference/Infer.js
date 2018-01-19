// type alias Infer x = Promise Error (x, InferState)
//
// type alias InferState = {
//      variableCounter: Int
// }


module.exports = $importAll([
    "./../Libs",
    "./Type"
]).then($imports => {
    const Array = $imports[0].Array;
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


    // infer: InferState -> AST -> Promise Error InferState
    const infer = declaration => inferState => {
        switch (declaration.kind) {
            case "NameDeclaration":
            default:
                return Promise.resolve(inferState);
        }
    };


    const inferModule = module => inferState =>
         Array.foldl(Promise.resolve(inferState))(acc => declaration => acc.then(is => infer(declaration)(is)))(module.declarations);


    return {
        extendTypeEnv,
        freshVariable,
        inferModule,
        initialInferState,
        initialTypeEnv,
        Schema
    };
});
