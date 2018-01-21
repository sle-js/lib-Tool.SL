module.exports = $import(
    "./Libs"
).then($imports => {
    const Assertion = $imports.Assertion;
    const Infer = $imports.Infer;
    const Unit = $imports.Unit;

    return Unit.Suite("TypeInference")([
        Unit.Suite("freshVariable")([
            Unit.Test("initInferState sets the variable counter to 0")(Assertion
                .equals(Infer.initialInferState.variableCounter)(0)),

            Infer.freshVariable(Infer.initialInferState).then(r =>
                Unit.Test("counter of 0 gives 'R' and the counter is updated to 1")(Assertion
                    .equals(r[0][1][1])("P")
                    .equals(r[1].variableCounter)(1))
            )
        ])
    ]);
});
