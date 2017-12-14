module.exports = $importAll([
    "./Libs"
]).then($imports => {
    const Array = $imports[0].Array;

    const mkState = indent => deltaIndent => ({
        indent,
        deltaIndent
    });


    const nextIndent = state =>
        Object.assign({}, state, {indent: state.indent + state.deltaIndent});


    const isLiteral = node =>
        node.type === "Literal";


    const isPattern = node =>
        node.type === "Identifier" ||
        node.type === "MemberExpression";


    const xAssignmentExpression = state => node =>
        `${isPattern(node.left) ? xPattern(state)(node.left) : xExpression(state)(node.left)} ${node.operator} ${xExpression(state)(node.right)}`;


    const xBody = state => node =>
        Array.map(xStatement(state))(node).join("\n");


    const xCallExpression = state => node =>
        "" + xExpression(state)(node.callee) + "(" + Array.map(xExpression(state))(node.arguments).join(", ") + ")";


    const xExpression = state => node => {
        switch (node.type) {
            case "Literal":
                return xLiteral(state)(node);
            case "ObjectExpression":
                return xObjectExpression(state)(node);
            case "Identifier":
                return xIdentifier(state)(node);
            case "CallExpression":
                return xCallExpression(state)(node);
            case "MemberExpression":
                return xMemberExpression(state)(node);
            default:
                return `=== unknown: xExpression: ${node.type}`;
        }
    };


    const xIdentifier = state => node =>
        node.name;


    const xLiteral = state => node =>
        node.value;


    const xMemberExpression = state => node =>
        node.computed
            ? `${xExpression(state)(node.object)}[${xExpression(state)(node.property)}]}`
            : `${xExpression(state)(node.object)}.${xExpression(state)(node.property)}`;


    const xObjectExpression = state => node =>
        Array.length(node.properties) === 0
            ? "{}"
            : `{\n${Array.map(xProperty(nextIndent(state)))(node.properties).join("")}}`;


    const xPattern = state => node =>
        node.type === "Identifier" ? xIdentifier(state)(node)
            : xMemberExpression(state)(node);


    const xProperty = state => node => {
        const key =
            isLiteral(node.key) ? xLiteral(state)(node.key) : xIdentifier(state)(node.key);

        const value =
            xExpression(state)(node.value);

        return key === value
            ? `${state.indent}${key}\n`
            : `${state.indent}${key}: ${value}\n`;
    };


    const xStatement = state => node =>
        node.type === "VariableDeclaration" ? `${xVariableDeclaration(state)(node)};\n`
            : node.type === "AssignmentExpression" ? `${xAssignmentExpression(state)(node)};\n`
            : `=== unknown: xStatement: ${node.type}`;


    const xVariableDeclaration = state => node =>
        Array.length(node.declarations) === 1
            ? `${state.indent}${node.kind} ${xVariableDeclarator(nextIndent(state))(node.declarations[0])}`
            : (state.indent + node.kind + "\n" + Array.map(d => `${state.indent}${state.deltaIndent}${xVariableDeclarator(nextIndent(state))(d)}`)(node.declarations).join(",\n") + "\n");


    const xVariableDeclarator = state => node =>
        xPattern(state)(node.id) + (node.init === undefined ? "" : (" =\n" + state.indent + xExpression(state)(node.init)));


    const translate = ast =>
        xBody(mkState("")("    "))(ast.body);


    return {
        translate
    };
});