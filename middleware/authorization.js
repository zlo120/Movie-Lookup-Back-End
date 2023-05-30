const jwt = require('jsonwebtoken');
const JWT_SECRET = "SJHSfsious8df7ShdsdhjasjkldSSAFuehtjknsdfm";

const authorize = (req, res, next) => {
    if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /)
    ) {
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
        return;
    }

    const token = req.headers.authorization.replace(/^Bearer /, "");
    return jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {

            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: true, message: "JWT token has expired" });
            }

            return res.status(401).json({ error: true, message: "Invalid JWT token" });
        }

        next();
    });

};

module.exports = authorize;