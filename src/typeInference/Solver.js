module.exports = $importAll([
    "../Libs",
    "./Type"
]).then($imports => {
    const Array = $imports[0].Array;
    const Dict = $imports[0].Dict;
    const Errors = $imports[0].Errors;
    const Set = $imports[0].Set;
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


    const unifierConstraint = u =>
        u[1];


    const occursCheck = name => type =>
        Set.member(name)(Type.ftv(type));


    const bind = name => type =>
        Type.isVariable(type) && Type.variableName(type) === name ? Promise.resolve([Subst.nullSubst, []])
            : occursCheck(name)(type) ? Promise.reject("error")
            : Promise.resolve([Subst.singleton(name)(type), []]);


    const typesApply = subst => types =>
        Array.map(Type.apply(subst))(types);


    const constraintsApply = subst => constraints =>
        Array.map(Array.map(Type.apply(subst)))(constraints);


    const unifies = t1 => t2 =>
        Type.equals(t1)(t2) ? emptyUnifier
            : Type.isVariable(t1) ? bind(Type.variableName(t1))(t2)
            : Type.isVariable(t2) ? bind(Type.variableName(t2))(t1)
                : Type.isFunction(t1) && Type.isFunction(t2) ? unifyMany([Type.functionDomain(t1), Type.functionRange(t1)])([Type.functionDomain(t2), Type.functionRange(t2)])
                    : Promise.reject(Errors.UnificationFail(Type.show(t1), Type.show(t2)));


    const unifyMany = t1s => t2s =>
        Array.reduce(
            () => Array.reduce(
                () => Promise.resolve(emptyUnifier))(
                t2h => t2t => Promise.reject(Errors.UnificationMismatch()))(t2s))(
            t1h => t1t => Array.reduce(
                () => Promise.reject(Errors.UnificationMismatch()))(
                t2h => t2t =>
                    unifies(t1h)(t2h)
                        .then(r1 => unifyMany(typesApply(unifierSubst(r1))(t1t))(typesApply(unifierSubst(r1))(t2t))
                            .then(r2 => Promise.resolve(newUnifier(Subst.compose(unifierSubst(r2))(unifierSubst(r1)))(Array.concat(unifierConstraint(r1))(unifierConstraint(r2))))))
            )(t2s))(t1s);


    const solve = subst => constraints =>
        Array.reduce(
            () => Promise.resolve(subst))(
            c => cs => unifies(c[0])(c[1])
                .then(r => solve(Subst.compose(r[0])(subst))(Array.concat(r[1])(constraintsApply(r[0])(cs))))
        )(constraints);


    const solver = constraints =>
        solve(Subst.nullSubst)(constraints);


    return {
        solver
    };
});
