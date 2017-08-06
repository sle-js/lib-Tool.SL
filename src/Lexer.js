const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;


function LexerState(configuration, state) {
    this.configuration = configuration;
    this.state = state;
}


LexerState.prototype.token = function () {
    return this.state.token;
};


LexerState.prototype.position = function () {
    return this.state.oldPosition;
};


LexerState.prototype.index = function () {
    return this.state.oldIndex;
};


LexerState.prototype.next = function () {
    if (this.eof()) {
        return this;
    } else {
        const currentState = skipWhitespaceComments(this.configuration)(this.state);
        if (isEndOfFile(currentState.index)(currentState.input)) {
            return new LexerState(this.configuration, finalState(this.configuration)(currentState));
        } else {
            const errorState = advanceState(currentState)(currentState.input[currentState.index])(this.configuration.err(currentState.input[currentState.index]));
            const mapTokenPattern = tokenPattern =>
                tokenPattern.first.matchFrom(currentState.input)(currentState.index).map(text => advanceState(currentState)(text)(tokenPattern.second(text)));

            return new LexerState(this.configuration, this.configuration.tokenPatterns.findMap(mapTokenPattern).withDefault(errorState));
        }
    }
};


LexerState.prototype.eof = function () {
    return this.state.token === this.configuration.eof;
};


const isEndOfFile = index => input =>
    (index >= input.length);


const skipWhitespaceComments = configuration => state => {
    const findComment = () =>
        Array.findMap(comment => comment.open.matchFrom(state.input)(state.index).map(_ => comment))(configuration.comments);

    const applyComment = comment => {
        let index = state.index + 1;

        while (!isEndOfFile(index)(state.input)) {
            const closeMatch = comment.close.matchFrom(state.input)(index);

            if (closeMatch.isJust()) {
                const commentString = state.input.substr(state.index, closeMatch.withDefault("").length + index - state.index);
                return advanceState(state)(commentString)(configuration.eof);
            } else {
                index += 1;
            }
        }

        return advanceState(state)(state.input.substr(state.index))(configuration.eof);
    };

    const possibleComment = findComment();

    return possibleComment.map(comment => skipWhitespaceComments(configuration)(applyComment(comment)))
        .withDefault(
            configuration
                .whitespacePattern
                .then(whitespacePattern => whitespacePattern.matchFrom(state.input)(state.index))
                .map(matchedText => skipWhitespaceComments(configuration)(advanceState(state)(matchedText)(configuration.eof)))
                .withDefault(state));
};


const mkRunningState = input => index => position => token => oldPosition => oldIndex => ({
    input: input,
    index: index,
    position: position,
    token: token,
    oldPosition: oldPosition,
    oldIndex: oldIndex
});


const advanceState = currentState => matchedText => matchedToken => {
    const advancedIndex = currentState.index + matchedText.length;
    const advancePositionOnCharacter = position => item =>
        item.charCodeAt(0) === 10
            ? [1, position[1] + 1]
            : [position[0] + 1, position[1]];
    const advancedPosition = String.foldl(matchedText)(currentState.position)(advancePositionOnCharacter);

    return mkRunningState(currentState.input)(advancedIndex)(advancedPosition)(matchedToken)(currentState.position)(currentState.index);
};


const initialState = input =>
    mkRunningState(input)(0)([1, 1])(undefined)([1, 1])(0);


const finalState = configuration => state =>
    mkRunningState(state.input)(state.input.length)(state.position)(configuration.eof)(state.position)(state.input.length);


const setup = configuration => ( {
    fromString: function (input) {
        return new LexerState(configuration, initialState(input)).next();
    }
});


module.exports = {
    setup
};
