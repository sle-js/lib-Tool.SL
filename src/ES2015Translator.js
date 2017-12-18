module.exports = $importAll([
    "./Libs"
]).then($imports => {
    const Array = $imports[0].Array;
    const Char = $imports[0].Char;
    const String = $imports[0].String;

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


    const xBlockStatement = state => node =>
        `{\n${xBody(nextIndent(state))(node.body)}${state.indent}${state.indent}}`;


    const xBody = state => node =>
        Array.map(xStatement(state))(node).join("\n");


    const xCallExpression = state => node =>
        "" + xExpression(state)(node.callee) + "(" + Array.map(xExpression(state))(node.arguments).join(", ") + ")";


    const xExpression = state => node => {
        switch (node.type) {
            case "CallExpression":
                return xCallExpression(state)(node);
            case "FunctionExpression":
                return xFunctionExpression(state)(node);
            case "Identifier":
                return xIdentifier(state)(node);
            case "Literal":
                return xLiteral(state)(node);
            case "MemberExpression":
                return xMemberExpression(state)(node);
            case "ObjectExpression":
                return xObjectExpression(state)(node);
            default:
                return `=== unknown: xExpression: ${node.type}`;
        }
    };


    const xFunctionExpression = state => node => {
        const params =
            Array.map(xPattern(state))(node.params);

        const xParams =
            Array.length(params) === 1
                ? Array.join(", ")(params)
                : `(${Array.join(", ")(params)})`;

        return `${xParams} => ${xBlockStatement(state)(node.body)}`;
    };


    const xIdentifier = state => node =>
        node.name;


    const xLiteral = state => node =>
        typeof node.value === "string"
            ? `"${node.value}"`
            : node.value;


    const xMemberExpression = state => node =>
        node.computed
            ? `${xExpression(state)(node.object)}[${xExpression(state)(node.property)}]}`
            : `${xExpression(state)(node.object)}.${xExpression(state)(node.property)}`;


    const xObjectExpression = state => node =>
        Array.length(node.properties) === 0
            ? "{}"
            : `{\n${Array.map(xProperty(nextIndent(state)))(node.properties).join("")}${state.indent}}`;


    const xPattern = state => node =>
        node.type === "Identifier" ? xIdentifier(state)(node)
            : xMemberExpression(state)(node);


    const xProperty = state => node => {
        const key =
            isLiteral(node.key) ? xLiteral(state)(node.key) : xIdentifier(state)(node.key);

        const value =
            xExpression(state)(node.value);

        return key === `"${value}"`
            ? `${state.indent}${value}\n`
            : `${state.indent}${key}: ${value}\n`;
    };


    const xReturnStatement = state => node =>
        `${state.indent}return${node.argument === null ? "" : ` ${xExpression(state)(node.argument)}`}`;


    const xStatement = state => node => {
        switch (node.type) {
            case "AssignmentExpression":
                return `${xAssignmentExpression(state)(node)};\n`;
            case "ReturnStatement":
                return `${xReturnStatement(state)(node)};\n`;
            case "VariableDeclaration":
                return `${xVariableDeclaration(state)(node)};\n`;
            default:
                return `=== unknown: xStatement: ${node.type}`;
        }
    };


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