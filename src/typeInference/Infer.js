// type alias Infer x = Promise Error (x, InferState)
//
// type alias Schema =
//      (List String) * Type
//
// type alias TypeEnv =
//      Dict String Schema
//
// type alias InferState = {
//      variableCounter: Int,
//      env: TypeEnv
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


    const schemaType = schema =>
        schema[1];


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
            Schema([])(Type.Variable(variableNameFromInt(infer.variableCounter))),
            Object.assign({}, infer, {
                variableCounter: infer.variableCounter + 1
            })]);


    const bindSchema = name => schema => is =>
        Promise.resolve(
            Object.assign({}, is, {
                env: extendTypeEnv(name)(schema)(is.env)
            })
        );


    const lookupInEnv = name => is =>
        Dict.get(name)(is.env)
            .reduce(
                () => Promise.reject(name + " is an unknown variable"))(
                t => Promise.resolve([t[1], is]));


    const uni = t1 => t2 => is =>
        Promise.resolve(Object.assign({}, is, {
            subst: Array.append([t1, t2])(is.subst)
        }));


    const openScope = is =>
        Object.assign({}, is, {
            scopes: Array.prepend(is.env)(is.scopes)
        });


    const closeScope = is =>
        Object.assign({}, is, {
            env: is.scopes[0],
            scopes: is.scopes.slice(1)
        });


    const initialInferState = {
        variableCounter: 0,
        env: initialTypeEnv,
        scopes: [],
        subst: []
    };


    // inferExpression: Expression -> InferState -> Promise Error (Type, InferState)
    const inferExpression = e => is => {
        switch (e.kind) {
            case "Apply":
                return inferExpression(e.operator)(is)
                    .then(t1 => inferExpression(e.operand)(t1[1])
                        .then(t2 => freshVariable(t2[1])
                            .then(tv => uni(t1[0])(Type.Function(t2[0])(schemaType(tv[0])))(tv[1])
                                .then(unifyResult => Promise.resolve([schemaType(tv[0]), unifyResult])))));

            case "ConstantBoolean":
                return Promise.resolve([Type.ConstantBool, is]);

            case "ConstantInteger":
                return Promise.resolve([Type.ConstantInt, is]);

            case "ConstantString":
                return Promise.resolve([Type.ConstantString, is]);

            case "Lambda": {
                const x =
                    e.names[0].value;

                return freshVariable(is)
                    .then(tv => bindSchema(x)(tv[0])(openScope(tv[1]))
                        .then(inferExpression(e.expression))
                        .then(et => Promise.resolve([Type.Function(schemaType(tv[0]))(et[0]), closeScope(et[1])])))
            }

            case "LowerIDReference":
                return lookupInEnv(e.name)(is);

            default:
                return Promise.reject("Unable to infer kind " + e.kind);
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
