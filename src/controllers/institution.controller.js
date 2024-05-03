const Joi = require("joi");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing Models
const Instituion = require("../models/institution.model");

exports.handleAddInstitution = async (req, res) => {
    try {
        const { name, type, establishedDate, address, mobile, email, about } =
            req.body;

        // Do joi validations

        const checkInstituionExists = await Instituion.findOne({ name });

        if (checkInstituionExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.INSTITUION_ALREADY_EXISTS,
            });
        }

        const instituionId = generateUUID();

        const instituion = await Instituion.create({
            instituionId,
            ...req.body,
        });

        return res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.CREATED,
            code: HttpStatusCode.Created,
            data: instituion,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.instituionController.handleAddInstituionErrorLog,
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
        const { instituionId } = req.params;

        const instituion = await Instituion.findOne({ instituionId });

        if (!instituion) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUION_NOT_FOUND,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: instituion,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.instituionController.handleAddInstituionErrorLog,
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
        const { instituionId } = req.params;

        const instituion = await Instituion.findOne({ instituionId });

        if (!instituion) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUION_NOT_FOUND,
            });
        }

        const { name, type, mobile, email, about } = req.body;

        instituion.name = name;
        instituion.type = type;
        instituion.mobile = mobile;
        instituion.email = email;
        instituion.about = about;

        await instituion.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.INSTITUION_UPDATED_SUCCESSFULLY,
            profile: instituion,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.instituionController
                .handleUpdateInstituionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
