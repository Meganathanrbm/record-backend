const Joi = require("joi");
const bcrypt = require("bcryptjs");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Models
const User = require("../models/user.model");
const Skill = require("../models/skill.model");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

exports.handleCheckUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;

        const userValidation = Joi.object({
            username: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.query);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const checkIsUserExists = await User.exists({
            username,
        });

        if (checkIsUserExists) {
            res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.USERNAME_ALREADY_EXISTS,
            });
        } else {
            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.USERNAME_AVAILABLE,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.userController
                .handleCheckUsernameAvailabilityErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateUsername = async (req, res) => {
    try {
        const { username } = req.body;

        const userValidation = Joi.object({
            username: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);
        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const checkIsUsernameAlreadyExists = await User.exists({
            username,
        });

        if (checkIsUsernameAlreadyExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.USERNAME_ALREADY_EXISTS,
            });
        }

        const { userId } = req.userSession;

        const checkIsUserExists = await User.findOne({
            userId,
        });

        if (!checkIsUserExists) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        } else {
            await User.findOneAndUpdate(
                {
                    userId,
                },
                {
                    $set: {
                        ...req.body,
                    },
                },
            );

            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.USER_UPDATED_SUCCESSFULLY,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.userController.handleUpdateUsernameErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleOnBoarding = async (req, res) => {
    try {
        const onBoardingValidation = Joi.array()
            .items(Joi.string().required())
            .required();

        const { error } = onBoardingValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const { userId } = req.userSession;

        const checkIsUserExists = await User.findOne({
            userId,
        });
        if (!checkIsUserExists) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        } else {
            const skillIds = req.body;

            const skillsExist = await Promise.all(
                skillIds.map(async (skillId) => {
                    const existingSkill = await Skill.findOne({ skillId });
                    return !!existingSkill;
                }),
            );

            const allSkillsExist = skillsExist.every((exists) => exists);

            if (allSkillsExist) {
                await User.findOneAndUpdate(
                    {
                        userId,
                    },
                    {
                        $set: {
                            interestBasedSkills: req.body,
                            isOnBoardingCompleted: true,
                        },
                    },
                );
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message: ResponseMessageConstant.USER_UPDATED_SUCCESSFULLY,
                });
            } else {
                return res.status(HttpStatusCode.BadRequest).json({
                    status: HttpStatusConstant.BAD_REQUEST,
                    code: HttpStatusCode.BadRequest,
                    message: ResponseMessageConstant.INVALID_SKILLS,
                });
            }
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.userController.handleOnBoardingErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
