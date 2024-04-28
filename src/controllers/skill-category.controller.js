const Joi = require("joi");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing models
const SkillCategory = require("../models/skill-category.model");

exports.handleCreateSkillCategory = async (req, res) => {
    try {
        const skillCategoryValidation = Joi.object({
            categoryName: Joi.string().required(),
        });

        const { error } = skillCategoryValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        } else {
            const { categoryName } = req.body;

            const transfromedSkillCategoryName = categoryName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-");

            const isSkillCategoryExists = await SkillCategory.exists({
                categoryName: transfromedSkillCategoryName,
            });

            if (isSkillCategoryExists) {
                return res.status(HttpStatusCode.Conflict).json({
                    status: HttpStatusConstant.CONFLICT,
                    code: HttpStatusCode.Conflict,
                    message:
                        ResponseMessageConstant.SKILL_CATEGORY_ALREADY_EXISTS,
                });
            } else {
                const skillCategoryId = generateUUID();

                const skillCategory = await SkillCategory.create({
                    skillCategoryId,
                    categoryName: transfromedSkillCategoryName,
                });
                return res.status(HttpStatusCode.Created).json({
                    status: HttpStatusConstant.CREATED,
                    code: HttpStatusCode.Created,
                    data: skillCategory,
                });
            }
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.skillCategoryController
                .handleCreateSkillCategoryErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateSkillCategory = async (req, res) => {
    try {
        const { skillCategoryId } = req.params;

        if (!skillCategoryId) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.SKILL_CATEGORY_ID_REQUIRED,
            });
        } else {
            const isSkillCategoryExists = await SkillCategory.exists({
                skillCategoryId,
            });

            if (!isSkillCategoryExists) {
                return res.status(HttpStatusCode.NotFound).json({
                    status: HttpStatusConstant.NOT_FOUND,
                    code: HttpStatusCode.NotFound,
                    message: ResponseMessageConstant.SKILL_CATEGORY_NOT_FOUND,
                });
            } else {
                const { categoryName } = req.body;

                const transfromedSkillCategoryName = categoryName
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-");

                const updatedSkillCategoryResponse =
                    await SkillCategory.findOneAndUpdate(
                        { skillCategoryId },
                        {
                            $set: {
                                categoryName: transfromedSkillCategoryName,
                            },
                        },
                        { new: true },
                    );
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    data: updatedSkillCategoryResponse,
                });
            }
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.skillCategoryController
                .handleUpdateSkillCategoryErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
