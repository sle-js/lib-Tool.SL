const Position = (line, column) =>
    ({line, column});


const LocationPosition = (source, position) =>
    ({source, position});


const LocationRange = (source, start, end) =>
    ({source, start, end});


const Errors = (kind) =>
    ({package: "Tool.SL", kind});


const ExpectedTokens = (loc, found, expected) =>
    Object.assign({},
        Errors("ExpectedTokens"),
        {kind: "ExpectedTokens", loc, found, expected});


module.exports = {
    Position,
    LocationPosition,
    LocationRange,
    Errors,
    ExpectedTokens
};