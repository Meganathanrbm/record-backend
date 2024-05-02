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
const Skill = require("../models/skill.model");

// Importing Controllers
const imageController = require("./image.controller");

exports.handleCreateSkill = async (req, res) => {
    try {
        const skillValidation = Joi.object({
            skillName: Joi.string().required(),
            skillCategoryId: Joi.string().required(),
        });

        const { error } = skillValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        } else {
            const { skillName, skillCategoryId, image } = req.body;
            const transfromedSkillName = skillName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, " ");
            const isSkillExists = await Skill.exists({
                skillName: transfromedSkillName,
            });

            if (isSkillExists) {
                return res.status(HttpStatusCode.Conflict).json({
                    status: HttpStatusConstant.CONFLICT,
                    code: HttpStatusCode.Conflict,
                    message: ResponseMessageConstant.SKILL_ALREADY_EXISTS,
                });
            } else {
                const skillId = generateUUID();

                const imageName = generateUUID();

                const imageUrl = await imageController.uploadImageToS3(
                    imageName,
                    req.file,
                );

                if (imageUrl == null) {
                    return res.status(HttpStatusCode.InternalServerError).json({
                        status: HttpStatusConstant.ERROR,
                        code: HttpStatusCode.InternalServerError,
                        message: ResponseMessageConstant.IMAGE_UPLOAD_FAILED,
                    });
                }

                const skillCategory = await Skill.create({
                    skillId,
                    skillName: transfromedSkillName,
                    skillCategoryId,
                    imageUrl,
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
            ErrorLogConstant.skillController.handleCreateSkillErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetAllSkills = async (req, res) => {
    try {
        const { searchTerm = "" } = req.query;

        const skillResponse = await Skill.aggregate([
            {
                $match: {
                    skillName: { $regex: searchTerm, $options: "i" },
                },
            },
            {
                $lookup: {
                    from: "skillcategories",
                    localField: "skillCategoryId",
                    foreignField: "skillCategoryId",
                    as: "skills",
                },
            },
            {
                $unwind: "$skills",
            },
            {
                $group: {
                    _id: "$skills.categoryName",
                    skills: {
                        $push: {
                            _id: "$_id",
                            skillId: "$skillId",
                            skillName: "$skillName",
                            skillCategoryId: "$skillCategoryId",
                            categoryName: "$skills.categoryName",
                            imageUrl: "$imageUrl",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                            __v: "$__v",
                        },
                    },
                },
            },
        ]);

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: skillResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.skillController.handleGetAllSkillsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
