// define utils error so no need to sent again and response like res.status(400).json({})
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor); // in which line the error is occurs we can understand by the captureStackTrace
    }
}

module.exports = AppError;