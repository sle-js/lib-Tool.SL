module.exports = $importAll([
    "./Array",
    "use:./SLAST.estree core:Tool.ESTree:1.0.3",
    "./typeInference/Type"
]).then($imports => {
        const Array = $imports[0];
        const SLAST = $imports[1];
        const Type = $imports[2];
        const Subst = Type.Subst;


        SLAST.apply = subst => ast => {
            const applyOnExpression = e => {
                switch (e.kind) {
                    case "Apply":
                        return SLAST.Apply(e.loc, Type.apply(subst)(e.type), applyOnExpression(e.operator), applyOnExpression(e.operand));

                    case "Binary":
                        return SLAST.Binary(e.loc, Type.apply(subst)(e.type), applyOnExpression(e.left), applyOnExpression(e.right));

                    case "ConstantBoolean":
                        return e;

                    case "ConstantInteger":
                        return e;

                    case "ConstantString":
                        return e;

                    case "If":
                        return SLAST.If(e.loc, Type.apply(subst)(e.type), applyOnExpression(e.testExpression), applyOnExpression(e.thenExpression), applyOnExpression(e.elseExpression));

                    case "Lambda":
                        return SLAST.Lambda(e.loc, Type.apply(subst)(e.type), e.names, applyOnExpression(e.expression));

                    case "LowerIDReference":
                        return SLAST.LowerIDReference(e.loc, Type.apply(subst)(e.type), e.name);

                    case "Not":
                        return SLAST.Not(e.loc, Type.apply(subst)(e.type), applyOnExpression(e.expression));

                    default:
                        return Promise.reject("Unable to applyOnExpression kind " + e.kind);
                }
            };

            const applyOnDeclaration = declaration =>
                SLAST.NameDeclaration(declaration.loc, declaration.name, applyOnExpression(declaration.expression));

            return Promise.resolve(SLAST.Module(ast.loc, Array.map(applyOnDeclaration)(ast.declarations)));
        };


        return SLAST;
    }
);