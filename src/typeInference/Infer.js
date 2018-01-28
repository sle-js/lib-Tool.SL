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
    "./Schema",
    "./Type",
    "./TypeEnv"
]).then($imports => {
    const Array = $imports[0].Array;
    const Dict = $imports[0].Dict;
    const Errors = $imports[0].Errors;
    const Schema = $imports[1];
    const Set = $imports[0].Set;
    const Subst = $imports[2].Subst;
    const Type = $imports[2];
    const TypeEnv = $imports[3];


    const variableNameFromInt = value =>
        (value < 26) ? String.fromCharCode(value + 97)
            : "a" + (value - 26);
    assumptionEqual(variableNameFromInt(0), "a");
    assumptionEqual(variableNameFromInt(10), "k");
    assumptionEqual(variableNameFromInt(25), "z");
    assumptionEqual(variableNameFromInt(26), "a0");
    assumptionEqual(variableNameFromInt(27), "a1");


    const freshVariable = infer =>
        Promise.resolve([
            Schema.Schema([])(Type.Variable(variableNameFromInt(infer.variableCounter))), {
                ...infer,
                variableCounter: infer.variableCounter + 1
            }]);


    const freshVariables = n => infer =>
        n === 0
            ? Promise.resolve([[], infer])
            : freshVariable(infer)
                .then(t => freshVariables(n - 1)(t[1])
                    .then(fv => Promise.resolve([Array.append(t[0])(fv[0]), fv[1]])));


    const bindSchema = name => schema => is =>
        Promise.resolve({
            ...is,
            env: TypeEnv.extend(name)(schema)(is.env)
        });


    const uni = t1 => t2 => is =>
        Promise.resolve({
            ...is,
            constraints: Array.append([t1, t2])(is.constraints)
        });


    const openScope = is =>
        ({
            ...is,
            scopes: Array.prepend(is.env)(is.scopes)
        });


    const closeScope = is =>
        ({
            ...is,
            env: is.scopes[0],
            scopes: is.scopes.slice(1)
        });


    const initialInferState = {
        variableCounter: 0,
        env: TypeEnv.empty,
        scopes: [],
        constraints: []
    };


    const instantiate = schema => is =>
        freshVariables(Array.length(Schema.names(schema)))(is)
            .then(fv => [
                Type.apply(Subst.fromArray(Array.zip(Schema.names(schema))(fv[0])))(Schema.type(schema)),
                fv[1]]);


    const generalise = type =>
        Schema.Schema(Set.asArray(Type.ftv(type)))(type);


    const lookupInEnv = loc => name => is =>
        Dict.get(name)(is.env)
            .reduce(
                () => Promise.reject(Errors.UnknownIdentifier (loc, name)))(
                t => instantiate(t)(is));


    const operationSignatures = {
        "||": Schema.Schema([])(Type.Function(Type.ConstantBool)(Type.Function(Type.ConstantBool)(Type.ConstantBool))),
        "&&": Schema.Schema([])(Type.Function(Type.ConstantBool)(Type.Function(Type.ConstantBool)(Type.ConstantBool))),

        "+": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantInt))),
        "-": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantInt))),
        "*": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantInt))),
        "/": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantInt))),

        "==": Schema.Schema(["a"])(Type.Function(Type.Variable("a"))(Type.Function(Type.Variable("a"))(Type.ConstantBool))),
        "!=": Schema.Schema(["a"])(Type.Function(Type.Variable("a"))(Type.Function(Type.Variable("a"))(Type.ConstantBool))),

        "<": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantBool))),
        "<=": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantBool))),
        ">": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantBool))),
        ">=": Schema.Schema([])(Type.Function(Type.ConstantInt)(Type.Function(Type.ConstantInt)(Type.ConstantBool)))
    };


    // inferExpression: Expression -> InferState -> Promise Error (Type, InferState)
    const inferExpression = e => is => {
        switch (e.kind) {
            case "Apply":
                return inferExpression(e.operator)(is)
                    .then(t1 => inferExpression(e.operand)(t1[1])
                        .then(t2 => freshVariable(t2[1])
                            .then(tv => uni(t1[0])(Type.Function(t2[0])(Schema.type(tv[0])))(tv[1])
                                .then(unifyResult => Promise.resolve([Schema.type(tv[0]), unifyResult])))));


            case "Binary": {
                const operation =
                    operationSignatures[e.operator.value];

                return operation === undefined
                    ? Promise.reject(Errors.UnknownOperator(e.operator.loc, e.operator.value))
                    : instantiate(operation)(is)
                        .then(os => freshVariable(os[1])
                            .then(fv => inferExpression(e.left)(fv[1])
                                .then(le => inferExpression(e.right)(le[1])
                                    .then(re => uni(Type.Function(le[0])(Type.Function(re[0])(Schema.type(fv[0]))))(os[0])(re[1])
                                        .then(unifyResult => Promise.resolve([Schema.type(fv[0]), unifyResult]))))));
            }

            case "ConstantBoolean":
                return Promise.resolve([Type.ConstantBool, is]);

            case "ConstantInteger":
                return Promise.resolve([Type.ConstantInt, is]);

            case "ConstantString":
                return Promise.resolve([Type.ConstantString, is]);

            case "If":
                return inferExpression(e.testExpression)(is)
                    .then(testType => inferExpression(e.thenExpression)(testType[1])
                        .then(thenType => inferExpression(e.elseExpression)(thenType[1])
                            .then(elseType => uni(testType[0])(Type.ConstantBool)(elseType[1])
                                .then(uni(thenType[0])(elseType[0]))
                                .then(finalIs => Promise.resolve([thenType[0], finalIs])))));

            case "Lambda": {
                const lambda = params => expression => is =>
                    Array.length(params) === 1
                        ? freshVariable(is)
                            .then(tv => bindSchema(params[0].value)(tv[0])(openScope(tv[1]))
                                .then(inferExpression(expression))
                                .then(et => Promise.resolve([Type.Function(Schema.type(tv[0]))(et[0]), closeScope(et[1])])))
                        : freshVariable(is)
                            .then(tv => bindSchema(params[0].value)(tv[0])(openScope(tv[1]))
                                .then(lambda(params.slice(1))(expression))
                                .then(et => Promise.resolve([Type.Function(Schema.type(tv[0]))(et[0]), closeScope(et[1])])));

                return lambda(e.names)(e.expression)(is);
            }

            case "LowerIDReference":
                return lookupInEnv(e.loc)(e.name)(is);

            case "Not":
                return inferExpression(e.expression)(is)
                    .then(t1 => uni(t1[0])(Type.ConstantBool)(t1[1]))
                    .then(t2 => Promise.resolve([Type.ConstantBool, t2]));

            default:
                return Promise.reject("Unable to infer kind " + e.kind);
        }
    };


    // infer: InferState -> AST -> Promise Error InferState
    const infer = declaration => is => {
        switch (declaration.kind) {
            case "NameDeclaration":
                return inferExpression(declaration.expression)(is)
                    .then(e1 => bindSchema(declaration.name.value)(generalise(e1[0]))(e1[1]));
            default:
                return Promise.resolve(is);
        }
    };


    const inferModule = module => inferState =>
        Array.foldl(Promise.resolve(inferState))(acc => declaration => acc.then(is => infer(declaration)(is)))(module.declarations);


    return {
        freshVariable,
        inferModule,
        initialInferState
    };
});
