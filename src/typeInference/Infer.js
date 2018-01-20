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


    const bindSchema = name => schema => is =>
        Promise.resolve(
            Object.assign({}, is, {
                env: extendTypeEnv(name)(schema)(is.env)
            })
        );


    const initialInferState = {
        variableCounter: 0,
        env: initialTypeEnv
    };


    // inferExpression: Expression -> InferState -> Promise Error (Type, InferState)
    const inferExpression = e => is => {
        switch (e.kind) {
            case "ConstantBoolean":
                return Promise.resolve([Type.typeBool, is]);

            case "ConstantInteger":
                return Promise.resolve([Type.typeInt, is]);

            case "ConstantString":
                return Promise.resolve([Type.typeString, is]);

            default:
                return Promise.resolve([Type.typeInt, is]);
        }
    };


    // infer: InferState -> AST -> Promise Error InferState
    const infer = declaration => is => {
        switch (declaration.kind) {
            case "NameDeclaration":
                return inferExpression(declaration.expression)(is)
                    .then(e1 =>
                        bindSchema(declaration.name.value)(Schema([])(e1[0]))(e1[1]));
            default:
                return Promise.resolve(is);
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
