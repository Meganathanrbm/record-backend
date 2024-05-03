const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");

const Staff = require("../models/staff.model");

const { verifyToken } = require("../helpers/jwt.helper");
const getRecordSignature = require("../helpers/cookie.helper");

const verifyUser = async (req, res, next) => {
    try {
        if (!req.headers.cookie) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
            });
        }

        const accessToken = getRecordSignature(req.headers.cookie);

        if (!accessToken) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
            });
        } else {
            const decodedToken = await verifyToken(accessToken);

            if (!decodedToken) {
                return res.status(HttpStatusCode.Unauthorized).json({
                    status: HttpStatusConstant.UNAUTHORIZED,
                    code: HttpStatusCode.Unauthorized,
                });
            }

            const staff = await Staff.findOne({
                staffId: decodedToken.staffId,
            });

            if (!staff) {
                return res.status(HttpStatusCode.Unauthorized).json({
                    status: HttpStatusConstant.UNAUTHORIZED,
                    code: HttpStatusCode.Unauthorized,
                });
            }

            req.staffSession = decodedToken;
            next();
        }
    } catch (error) {
        res.status(HttpStatusCode.Unauthorized).json({
            status: HttpStatusConstant.UNAUTHORIZED,
            code: HttpStatusCode.Unauthorized,
            message: ResponseMessageConstant.INVALID_TOKEN,
        });
    }
};

module.exports = verifyUser;
