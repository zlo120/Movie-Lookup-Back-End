const jwt = require('jsonwebtoken');
const JWT_SECRET = "SJHSfsious8df7ShdsdhjasjkldSSAFuehtjknsdfm";

const authorize = (req, res, next) => {

    if (!("authorization" in req.headers)) {

        if (req.method === 'GET') {

            res.locals.isAuthenticated = false;
            return next();
        }

        return res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
    }

    if (!req.headers.authorization.match(/^Bearer /)) {
        return res.status(401).json({ error: true, message: "Authorization header is malformed" });
    }

    if (req.method === 'GET') {

        res.locals.isAuthenticated = true;
        return next();
    }

    if (req.method === 'PUT') {
        const token = req.headers.authorization.replace(/^Bearer /, "");

        return jwt.verify(token, JWT_SECRET, function (err, decoded) {
            // if the token is invalid
            if (err) {

                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ error: true, message: "JWT token has expired" });
                }

                return res.status(401).json({ error: true, message: "Invalid JWT token" });

            }

            const email = req.params.email;
            // if its a valid token, but the user that is attempted to update is not the same as the user attempting to update
            if (decoded && decoded.email !== email) {
                return (res.status(403).json({
                    error: true,
                    message: "Forbidden"
                }
                ));
            }

            // if the token is valid and the user that is trying to be updated is attempted by the same user that is logged in
            return next();

        });


    }
};

module.exports = authorize;