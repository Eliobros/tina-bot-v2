class DangerError extends Error {
    constructor(message) {
        super(message);
        this.name = "DangerErros"
    }
}

module.exports = {
    DangerError,
}