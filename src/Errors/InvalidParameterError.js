class InvalidParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "InavlidParameterError"
    }
}

module.exports = {
    InvalidParameterError,
}