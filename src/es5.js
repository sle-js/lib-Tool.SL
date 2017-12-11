const Node = (type, loc) =>
    ({type, loc});


const SourceLocation = (source, start, end) =>
    ({source, start, end});


const Position = (line, column) =>
    ({line, column});


const Identifier = (loc, name) =>
    Object.assign({},
        Expression("Identifier", loc),
        Pattern("Identifier", loc),
        {type: "Identifier", name});


const Literal = (loc, value) =>
    Object.assign({},
        Expression("Literal", loc),
        {type: "Literal", value});


const RegExpLiteral = (loc, value, regex) =>
    Object.assign({},
        Literal(loc, value),
        {regex});


const Program = (loc, body) =>
    Object.assign({},
        Node("Program", loc),
        {type: "Program", body});


const Function = (type, loc, id, params, body) =>
    Object.assign({},
        Node(type, loc),
        {id, params, body});


const Statement = (type, loc) =>
    Object.assign({},
        Node(type, loc));


const ExpressionStatement = (loc, expression) =>
    Object.assign({},
        Statement("ExpressionStatement", loc),
        {type: "ExpressionStatement", expression});


const Directive = (loc, expression, directive) =>
    Object.assign({},
        Node("ExpressionStatement", loc),
        {type: "ExpressionStatement", expression, directive});


const BlockStatement = (loc, body) =>
    Object.assign({},
        Statement("BlockStatement", loc),
        {type: "BlockStatement", body});


const FunctionBody = (loc, body) =>
    Object.assign({},
        BlockStatement(loc, body),
        {body});


const EmptyStatement = (loc) =>
    Object.assign({},
        Statement("EmptyStatement", loc),
        {type: "EmptyStatement"});


const DebuggerStatement = (loc) =>
    Object.assign({},
        Statement("DebuggerStatement", loc),
        {type: "DebuggerStatement"});


const WithStatement = (loc, object, body) =>
    Object.assign({},
        Statement("WithStatement", loc),
        {type: "WithStatement", object, body});


const ReturnStatement = (loc, argument) =>
    Object.assign({},
        Statement("ReturnStatement", loc),
        {type: "ReturnStatement", argument});


const LabeledStatement = (loc, label, body) =>
    Object.assign({},
        Statement("LabeledStatement", loc),
        {type: "LabeledStatement", label, body});


const BreakStatement = (loc, label) =>
    Object.assign({},
        Statement("BreakStatement", loc),
        {type: "BreakStatement", label});


const ContinueStatement = (loc, label) =>
    Object.assign({},
        Statement("ContinueStatement", loc),
        {type: "ContinueStatement", label});


const IfStatement = (loc, test, consequent, alternate) =>
    Object.assign({},
        Statement("IfStatement", loc),
        {type: "IfStatement", test, consequent, alternate});


const SwitchStatement = (loc, discriminant, cases) =>
    Object.assign({},
        Statement("SwitchStatement", loc),
        {type: "SwitchStatement", discriminant, cases});


const SwitchCase = (loc, test, consequent) =>
    Object.assign({},
        Node("SwitchCase", loc),
        {type: "SwitchCase", test, consequent});


const ThrowStatement = (loc, argument) =>
    Object.assign({},
        Statement("ThrowStatement", loc),
        {type: "ThrowStatement", argument});


const TryStatement = (loc, block, handler, finalizer) =>
    Object.assign({},
        Statement("TryStatement", loc),
        {type: "TryStatement", block, handler, finalizer});


const CatchClause = (loc, param, body) =>
    Object.assign({},
        Node("CatchClause", loc),
        {type: "CatchClause", param, body});


const WhileStatement = (loc, test, body) =>
    Object.assign({},
        Statement("WhileStatement", loc),
        {type: "WhileStatement", test, body});


const DoWhileStatement = (loc, body, test) =>
    Object.assign({},
        Statement("DoWhileStatement", loc),
        {type: "DoWhileStatement", body, test});


const ForStatement = (loc, init, test, update, body) =>
    Object.assign({},
        Statement("ForStatement", loc),
        {type: "ForStatement", init, test, update, body});


const ForInStatement = (loc, left, right, body) =>
    Object.assign({},
        Statement("ForInStatement", loc),
        {type: "ForInStatement", left, right, body});


const Declaration = (type, loc) =>
    Object.assign({},
        Statement(type, loc));


const FunctionDeclaration = (loc, id, params, body) =>
    Object.assign({},
        Function("FunctionDeclaration", loc, id, params, body),
        Declaration("FunctionDeclaration", loc),
        {type: "FunctionDeclaration", id});


const VariableDeclaration = (loc, declarations) =>
    Object.assign({},
        Declaration("VariableDeclaration", loc),
        {type: "VariableDeclaration", declarations, kind: "var"});


const VariableDeclarator = (loc, id, init) =>
    Object.assign({},
        Node("VariableDeclarator", loc),
        {type: "VariableDeclarator", id, init});


const Expression = (type, loc) =>
    Object.assign({},
        Node(type, loc));


const ThisExpression = (loc) =>
    Object.assign({},
        Expression("ThisExpression", loc),
        {type: "ThisExpression"});


const ArrayExpression = (loc, elements) =>
    Object.assign({},
        Expression("ArrayExpression", loc),
        {type: "ArrayExpression", elements});


const ObjectExpression = (loc, properties) =>
    Object.assign({},
        Expression("ObjectExpression", loc),
        {type: "ObjectExpression", properties});


const Property = (loc, key, value, kind) =>
    Object.assign({},
        Node("Property", loc),
        {type: "Property", key, value, kind});


const FunctionExpression = (loc, id, params, body) =>
    Object.assign({},
        Function("FunctionExpression", loc, id, params, body),
        Expression("FunctionExpression", loc),
        {type: "FunctionExpression"});


const UnaryExpression = (loc, operator, prefix, argument) =>
    Object.assign({},
        Expression("UnaryExpression", loc),
        {type: "UnaryExpression", operator, prefix, argument});


const UnaryOperator = (value) =>
    (value === "-"
    || value === "+"
    || value === "!"
    || value === "~"
    || value === "typeof"
    || value === "void"
    || value === "delete")
        ? value
        : undefined;


const UpdateExpression = (loc, operator, argument, prefix) =>
    Object.assign({},
        Expression("UpdateExpression", loc),
        {type: "UpdateExpression", operator, argument, prefix});


const UpdateOperator = (value) =>
    (value === "++"
    || value === "--")
        ? value
        : undefined;


const BinaryExpression = (loc, operator, left, right) =>
    Object.assign({},
        Expression("BinaryExpression", loc),
        {type: "BinaryExpression", operator, left, right});


const BinaryOperator = (value) =>
    (value === "=="
    || value === "!="
    || value === "==="
    || value === "!=="
    || value === "<"
    || value === "<="
    || value === ">"
    || value === ">="
    || value === "<<"
    || value === ">>"
    || value === ">>>"
    || value === "+"
    || value === "-"
    || value === "*"
    || value === "/"
    || value === "%"
    || value === "|"
    || value === "^"
    || value === "&"
    || value === "in"
    || value === "instanceof")
        ? value
        : undefined;


const AssignmentExpression = (loc, operator, left, right) =>
    Object.assign({},
        Expression("AssignmentExpression", loc),
        {type: "AssignmentExpression", operator, left, right});


const AssignmentOperator = (value) =>
    (value === "="
    || value === "+="
    || value === "-="
    || value === "*="
    || value === "/="
    || value === "%="
    || value === "<<="
    || value === ">>="
    || value === ">>>="
    || value === "|="
    || value === "^="
    || value === "&=")
        ? value
        : undefined;


const LogicalExpression = (loc, operator, left, right) =>
    Object.assign({},
        Expression("LogicalExpression", loc),
        {type: "LogicalExpression", operator, left, right});


const LogicalOperator = (value) =>
    (value === "||"
    || value === "&&")
        ? value
        : undefined;


const MemberExpression = (loc, object, property, computed) =>
    Object.assign({},
        Expression("MemberExpression", loc),
        Pattern("MemberExpression", loc),
        {type: "MemberExpression", object, property, computed});


const ConditionalExpression = (loc, test, alternate, consequent) =>
    Object.assign({},
        Expression("ConditionalExpression", loc),
        {type: "ConditionalExpression", test, alternate, consequent});


const CallExpression = (loc, callee, arguments) =>
    Object.assign({},
        Expression("CallExpression", loc),
        {type: "CallExpression", callee, arguments});


const NewExpression = (loc, callee, arguments) =>
    Object.assign({},
        Expression("NewExpression", loc),
        {type: "NewExpression", callee, arguments});


const SequenceExpression = (loc, expressions) =>
    Object.assign({},
        Expression("SequenceExpression", loc),
        {type: "SequenceExpression", expressions});


const Pattern = (type, loc) =>
    Object.assign({},
        Node(type, loc));


module.exports = {
    Node,
    SourceLocation,
    Position,
    Identifier,
    Literal,
    RegExpLiteral,
    Program,
    Function,
    Statement,
    ExpressionStatement,
    Directive,
    BlockStatement,
    FunctionBody,
    EmptyStatement,
    DebuggerStatement,
    WithStatement,
    ReturnStatement,
    LabeledStatement,
    BreakStatement,
    ContinueStatement,
    IfStatement,
    SwitchStatement,
    SwitchCase,
    ThrowStatement,
    TryStatement,
    CatchClause,
    WhileStatement,
    DoWhileStatement,
    ForStatement,
    ForInStatement,
    Declaration,
    FunctionDeclaration,
    VariableDeclaration,
    VariableDeclarator,
    Expression,
    ThisExpression,
    ArrayExpression,
    ObjectExpression,
    Property,
    FunctionExpression,
    UnaryExpression,
    UnaryOperator,
    UpdateExpression,
    UpdateOperator,
    BinaryExpression,
    BinaryOperator,
    AssignmentExpression,
    AssignmentOperator,
    LogicalExpression,
    LogicalOperator,
    MemberExpression,
    ConditionalExpression,
    CallExpression,
    NewExpression,
    SequenceExpression,
    Pattern
};