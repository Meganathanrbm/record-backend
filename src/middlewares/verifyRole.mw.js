const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");

const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.staffSession) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
            });
        }

        if (!roles.includes(req.staffSession.role)) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
                message: ResponseMessageConstant.INSUFFICIENT_ROLE,
            });
        }

        next();
    };
};

module.exports = verifyRole;
