const { DangerError } = require('./dangerError');
const { InvalidParameterError } = require("./InvalidParameterError");
const {WarningError} = require('./WarningError');

module.exports = {
    DangerError,
    InvalidParameterError,
    WarningError,
}