module.exports = $importAll([
    "../Libs",
    "./Type"
]).then($imports => {
    const Array = $imports[0].Array;
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


    return {
        names,
        Schema,
        show,
        type
    };
});