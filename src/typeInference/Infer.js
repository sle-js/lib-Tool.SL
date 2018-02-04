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
    const SLAST = $imports[0].SLAST;
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
        Promise.resolve({
            schema: Schema.Schema([])(Type.Variable(variableNameFromInt(infer.variableCounter))),
            is: {
                ...infer,
                variableCounter: infer.variableCounter + 1
            }
        })
    ;


    const freshVariables = n => infer =>
        n === 0
            ? Promise.resolve({
                schemas: [],
                is: infer
            })
            : freshVariable(infer)
                .then(t => freshVariables(n - 1)(t.is)
                    .then(fv => Promise.resolve({
                        schemas: Array.append(t.schema)(fv.schemas),
                        is: fv.is
                    })));


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
            .then(fv => ({
                type: Type.apply(Subst.fromArray(Array.zip(Schema.names(schema))(fv.schemas)))(Schema.type(schema)),
                is: fv.is
            }));


    const generalise = type =>
        Schema.Schema(Set.asArray(Type.ftv(type)))(type);


    const lookupInEnv = loc => name => is =>
        Dict.get(name)(is.env).reduce(
            () => Promise.reject(Errors.UnknownIdentifier(loc, name)))(
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


    // inferExpression: Expression -> InferState -> Promise Error {ast: SLAST, is: InferState}
    const inferExpression = e => is => {
        switch (e.kind) {
            case "Apply":
                return inferExpression(e.operator)(is)
                    .then(t1 => inferExpression(e.operand)(t1.is)
                        .then(t2 => freshVariable(t2.is)
                            .then(tv => uni(t1.ast.type)(Type.Function(t2.ast.type)(Schema.type(tv.schema)))(tv.is)
                                .then(unifyResult => Promise.resolve({
                                    ast: SLAST.Apply(e.loc, Schema.type(tv.schema), t1.ast, t2.ast),
                                    is: unifyResult
                                })))));


            case "Binary": {
                const operation =
                    operationSignatures[e.operator.value];

                return operation === undefined
                    ? Promise.reject(Errors.UnknownOperator(e.operator.loc, e.operator.value))
                    : instantiate(operation)(is)
                        .then(os => freshVariable(os.is)
                            .then(fv => inferExpression(e.left)(fv.is)
                                .then(le => inferExpression(e.right)(le.is)
                                    .then(re => uni(Type.Function(le.ast.type)(Type.Function(re.ast.type)(Schema.type(fv.schema))))(os.type)(re.is)
                                        .then(unifyResult => Promise.resolve({
                                            ast: SLAST.Binary(e.loc, Schema.type(fv.schema), e.operator, le.ast, re.ast),
                                            is: unifyResult
                                        }))))));
            }

            case "ConstantBoolean":
                return Promise.resolve({
                    ast: SLAST.ConstantBoolean(e.loc, Type.ConstantBool, e.value),
                    is: is
                });

            case "ConstantInteger":
                return Promise.resolve({
                    ast: SLAST.ConstantInteger(e.loc, Type.ConstantInt, e.value),
                    is: is
                });

            case "ConstantString":
                return Promise.resolve({
                    ast: SLAST.ConstantString(e.loc, Type.ConstantString, e.value),
                    is: is
                });

            case "If":
                return inferExpression(e.testExpression)(is)
                    .then(testType => inferExpression(e.thenExpression)(testType.is)
                        .then(thenType => inferExpression(e.elseExpression)(thenType.is)
                            .then(elseType => uni(testType.ast.type)(Type.ConstantBool)(elseType.is)
                                .then(uni(thenType.ast.type)(elseType.ast.type))
                                .then(finalIs => Promise.resolve({
                                    ast: SLAST.If(e.loc, thenType.ast.type, testType.ast, thenType.ast, elseType.ast),
                                    is: finalIs
                                })))));

            case "Lambda": {
                const lambda = params => expression => is =>
                    Array.length(params) === 1
                        ? freshVariable(is)
                            .then(tv => bindSchema(params[0].value)(tv.schema)(openScope(tv.is))
                                .then(inferExpression(expression))
                                .then(et => Promise.resolve({
                                    type: Type.Function(Schema.type(tv.schema))(et.ast.type),
                                    ast: et.ast,
                                    is: closeScope(et.is)
                                })))
                        : freshVariable(is)
                            .then(tv => bindSchema(params[0].value)(tv.schema)(openScope(tv.is))
                                .then(lambda(params.slice(1))(expression))
                                .then(et => Promise.resolve({
                                    type: Type.Function(Schema.type(tv.schema))(et.type),
                                    ast: et.ast,
                                    is: closeScope(et.is)
                                })));

                return lambda(e.names)(e.expression)(is)
                    .then(l => Promise.resolve({
                        ast: SLAST.Lambda(e.loc, l.type, e.names, l.ast),
                        is: l.is
                    }));
            }

            case "LowerIDReference":
                return lookupInEnv(e.loc)(e.name)(is)
                    .then(id => Promise.resolve({
                        ast: SLAST.LowerIDReference(e.loc, id.type, e.name),
                        is: id.is
                    }));

            case "Not":
                return inferExpression(e.expression)(is)
                    .then(t1 => uni(t1.ast.type)(Type.ConstantBool)(t1.is)
                        .then(t2 => Promise.resolve({
                            ast: SLAST.Not(e.loc, Type.ConstantBool, t1.ast),
                            is: t2
                        })));

            default:
                return Promise.reject("Unable to infer kind " + e.kind);
        }
    };


    // infer: InferState -> AST -> Promise Error InferState
    const infer = declaration => is => {
        switch (declaration.kind) {
            case "NameDeclaration":
                return inferExpression(declaration.expression)(is)
                    .then(e1 => bindSchema(declaration.name.value)(generalise(e1.ast.type))(e1.is));
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
