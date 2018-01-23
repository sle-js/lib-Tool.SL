module.exports = $importAll([
    "../Libs",
    "./Type"
]).then($imports => {
    const Array = $imports[0].Array;
    const Set = $imports[0].Set;
    const Type = $imports[1];


    const Schema = names => type =>
        [names, type];


    const names = schema =>
        schema[0];


    const type = schema =>
        schema[1];


    const show = schema =>
        Array.length(names(schema)) === 0
            ? Type.show(type(schema))
            : `forall ${Array.join(", ")(names(schema))}: ${Type.show(type(schema))}`;
    assumptionEqual(show(Schema([])(Type.ConstantBool)), "Bool");
    assumptionEqual(show(Schema(["P", "Q"])(Type.Function(Type.Variable("P"))(Type.Variable("Q")))), "forall P, Q: P -> Q");


    const ftv = schema =>
        Set.fromArray(names(schema));
    assumption(Set.equals(ftv(Schema([])(Type.ConstantBool)))(Set.empty));
    assumption(Set.equals(ftv(Schema(["A", "B"])(Type.ConstantBool)))(Set.fromArray(["A", "B"])));


    return {
        ftv,
        names,
        Schema,
        show,
        type
    };
});