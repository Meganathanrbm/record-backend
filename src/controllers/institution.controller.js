const Joi = require("joi");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing Models
const Institution = require("../models/institution.model");
const Staff = require("../models/staff.model");

exports.handleAddInstitution = async (req, res) => {
    try {
        const { name, type, establishedDate, address, mobile, email, about } =
            req.body;

        // Do joi validations

        const checkInstitutionExists = await Institution.findOne({ name });

        if (checkInstitutionExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.INSTITUTION_ALREADY_EXISTS,
            });
        }

        const institutionId = generateUUID();

        const institution = await Institution.create({
            institutionId,
            ...req.body,
        });

        return res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.CREATED,
            code: HttpStatusCode.Created,
            data: institution,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.institutionController.handleAddInstitutionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetInstitution = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: institution,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.institutionController.handleGetInstitutionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateInstiution = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const { name, type, mobile, email, about } = req.body;

        institution.name = name;
        institution.type = type;
        institution.mobile = mobile;
        institution.email = email;
        institution.about = about;

        await institution.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.INSTITUTION_UPDATED_SUCCESSFULLY,
            profile: institution,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.institutionController
                .handleUpdateInstitutionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
