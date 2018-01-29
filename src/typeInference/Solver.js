module.exports = $importAll([
    "../Libs",
    "./Type"
]).then($imports => {
    const Array = $imports[0].Array;
    const Dict = $imports[0].Dict;
    const Errors = $imports[0].Errors;
    const Type = $imports[1];
    const Subst = Type.Subst;


    const newUnifier = s => c =>
        [s, c];


    const emptyUnifier =
        Promise.resolve(newUnifier(Subst.nullSubst)([]));


    const isEmptyUnifier = u =>
        Subst.isNullSubst(u[0]) && Array.isEmpty(u[1]);


    const unifierSubst = u =>
        u[0];


    const unifierConstaint = u =>
        u[1];


    const bind = name => type =>
        Promise.resolve([Subst.singleton(name)(type), []]);


    const apply = subst => types =>
        Array.map(Type.apply(subst))(types);


    const unifies = t1 => t2 =>
        Type.equals(t1)(t2)
            ? emptyUnifier
            : Type.isVariable(t1) ? bind(Type.variableName(t1))(t2)
            : Type.isVariable(t2) ? bind(Type.variableName(t2))(t1)
                : unifyMany([Type.functionDomain(t1), Type.functionRange(t1)])([Type.functionDomain(t2), Type.functionRange(t2)]);


    const unifyMany = t1s => t2s =>
        Array.reduce(
            () => Array.reduce(
                () => Promise.resolve(emptyUnifier))(
                t2h => t2t => Promise.reject(Errors.UnificationMismatch()))(t2s))(
            t1h => t1t => Array.reduce(
                () => Promise.reject(Errors.UnificationMismatch()))(
                t2h => t2t =>
                    unifies(t1h)(t2h)
                        .then(r1 => unifyMany(apply(unifierSubst(r1))(t1t))(apply(unifierSubst(r1))(t2t))
                            .then(r2 => Promise.resolve(newUnifier(Subst.compose(unifierSubst(r2))(unifierSubst(r1)))(Array.concat(unifierConstaint(r1))(unifierConstaint(r2)))))
                        )
            )(t2s))(t1s);


    const solver = constraints =>
        Array.reduce(
            () => Promise.resolve(Dict.empty))(
            c => cs => unifies(c[0])(c[1])
                .then(r => Promise.resolve(r))
        )(constraints);


    return {
        solver
    };
});
