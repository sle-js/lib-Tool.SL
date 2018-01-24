module.exports = $importAll([
    "./../Libs"
]).then($imports => {
    const Dict = $imports[0].Dict;
    const Set = $imports[0].Set;


    const Variable = name =>
        [0, name];


    const isVariable = type =>
        type[0] === 0;


    const variableName = type =>
        type[1];


    const Constant = name =>
        [1, name];


    const isConstant = type =>
        type[0] === 1;


    const constantName = type =>
        type[1];


    const Function = domain => range =>
        [2, domain, range];


    const isFunction = type =>
        type[0] === 2;


    const functionDomain = type =>
        type[1];


    const functionRange = type =>
        type[2];


    const ConstantInt =
        Constant("Int");


    const ConstantBool =
        Constant("Bool");


    const ConstantString =
        Constant("String");


    const show = t => {
        const showDomain = item =>
            isFunction(item) ? `(${show(item)})` : show(item);

        const showRange = item =>
            isFunction(item) && isFunction(functionDomain(item)) ? `(${show(item)})` : show(item);

        return isConstant(t) ? constantName(t) : isVariable(t) ? variableName(t) : `${showDomain(functionDomain(t))} -> ${showRange(functionRange(t))}`;
    };
    assumptionEqual(show(ConstantBool), "Bool");
    assumptionEqual(show(Variable("P")), "P");
    assumptionEqual(show(Function(Variable("P"))(ConstantBool)), "P -> Bool");
    assumptionEqual(show(Function(Function(ConstantInt)(Variable("P")))(Function(Variable("Q"))(ConstantBool))), "(Int -> P) -> Q -> Bool");


    const ftv = type =>
        isConstant(type) ? Set.empty
            : isVariable(type) ? Set.singleton(variableName(type))
            : Set.union(ftv(functionDomain(type)))(ftv(functionRange(type)));
    assumption(Set.equals(ftv(ConstantInt))(Set.empty));
    assumption(Set.equals(ftv(Variable("A")))(Set.singleton("A")));
    assumption(Set.equals(ftv(Function(Variable("A"))(Variable("B"))))(Set.fromArray(["A", "B"])));


    const apply = subst => type =>
        isConstant(type) ? type
            : isVariable(type) ? Dict.getWithDefault(type)(variableName(type))(subst)
            : Function(apply(subst)(functionDomain(type)))(apply(subst)(functionRange(type)));


    const Subst = {
        nullSubst: Dict.empty,
        getWithDefault: Dict.getWithDefault,
        fromArray: Dict.fromArray
    };


    return {
        apply,
        Constant,
        ConstantBool,
        ConstantInt,
        constantName,
        ConstantString,
        ftv,
        Function,
        functionDomain,
        functionRange,
        isConstant,
        isFunction,
        isVariable,
        show,
        Subst,
        Variable,
        variableName
    };
});
