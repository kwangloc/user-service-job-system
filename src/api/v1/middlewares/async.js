function asyncMiddleware(handler) { // handler is a async func
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = asyncMiddleware;