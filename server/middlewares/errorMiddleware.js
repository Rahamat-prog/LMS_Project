
const errorMiddleware = (err, req, res, next) => {
// fallback error suppose you don't provide statuscode or anything wrong in the controller 
err.statusCode = err.statusCode || 500;
err.message = err.message || "something went wrong";

    // here we have catch the error and sent as a response 
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: err.stack
    })
}

module.exports = errorMiddleware;