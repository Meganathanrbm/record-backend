const Joi = require("joi");

// Importing models
const User = require("../../models/user.model");
const Skill = require("../../models/skill.model");
const SkillCategory = require("../../models/skill-category.model");

// Importing Constants
const HttpStatusConstant = require("../../constants/http-message.constant");
const HttpStatusCode = require("../../constants/http-code.constant");
const ResponseMessageConstant = require("../../constants/response-message.constant");
const ErrorLogConstant = require("../../constants/error-log.constant");

// Importing Controllers
const imageController = require("../image.controller");

// Importing Helpers
const generateUUID = require("../../helpers/uuid.helper");

const appendSkillsDetails = async (items) => {
    for (let item of items) {
        if (item.skills && item.skills.length > 0) {
            for (let skill of item.skills) {
                try {
                    const skillDetails = await Skill.findOne({
                        skillId: skill.skillId,
                    });
                    if (skillDetails) {
                        skill.skillName = skillDetails.skillName;
                        skill.imageUrl = skillDetails.imageUrl;
                        skill.skillCategoryId = skillDetails.skillCategoryId;
                    }
                } catch (error) {
                    console.error("Error while fetching skill details:", error);
                }
            }
        }
    }
    return items;
};

exports.appendSkillsDetails = appendSkillsDetails;

const appendInteresetBasedSkillsDetails = async (skillIds) => {
    const skillDetailsPromises = skillIds.map(async (skillId) => {
        try {
            const skillDetails = await Skill.findOne({ skillId });
            if (skillDetails) {
                return {
                    skillId: skillId,
                    skillName: skillDetails.skillName,
                    imageUrl: skillDetails.imageUrl,
                    skillCategoryId: skillDetails.skillCategoryId,
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error while fetching skill details:", error);
            return null;
        }
    });
    const skillDetailsArray = await Promise.all(skillDetailsPromises);
    return skillDetailsArray.filter((skill) => skill !== null);
};

exports.appendInteresetBasedSkillsDetails = appendInteresetBasedSkillsDetails;

exports.handleGetUserProfileInfo = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const checkIsUserExists = await User.exists({
            userId,
        });

        if (!checkIsUserExists) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        } else {
            const userProfileInfoResponse = await User.aggregate([
                {
                    $match: {
                        userId,
                    },
                },
                {
                    $lookup: {
                        from: "educations",
                        localField: "userId",
                        foreignField: "userId",
                        as: "educations",
                    },
                },
                {
                    $lookup: {
                        from: "workexperiences",
                        localField: "userId",
                        foreignField: "userId",
                        as: "workexperiences",
                    },
                },
                {
                    $lookup: {
                        from: "licensecertifications",
                        localField: "userId",
                        foreignField: "userId",
                        as: "licensecertifications",
                    },
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "userId",
                        foreignField: "userId",
                        as: "projects",
                    },
                },
                {
                    $lookup: {
                        from: "activities",
                        localField: "userId",
                        foreignField: "userId",
                        as: "activities",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userId: 0,
                        password: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        __v: 0,
                        "educations._id": 0,
                        "educations.userId": 0,
                        "educations.createdAt": 0,
                        "educations.updatedAt": 0,
                        "educations.__v": 0,
                        "educations.verificationId": 0,
                        "workexperiences._id": 0,
                        "workexperiences.userId": 0,
                        "workexperiences.createdAt": 0,
                        "workexperiences.updatedAt": 0,
                        "workexperiences.__v": 0,
                        "workexperiences.verificationId": 0,
                        "workexperiences.skills._id": 0,
                        "licensecertifications._id": 0,
                        "licensecertifications.userId": 0,
                        "licensecertifications.createdAt": 0,
                        "licensecertifications.updatedAt": 0,
                        "licensecertifications.__v": 0,
                        "licensecertifications.verificationId": 0,
                        "licensecertifications.skills._id": 0,
                        "projects._id": 0,
                        "projects.userId": 0,
                        "projects.createdAt": 0,
                        "projects.updatedAt": 0,
                        "projects.__v": 0,
                        "projects.verificationId": 0,
                        "projects.skills._id": 0,
                        "activities._id": 0,
                        "activities.userId": 0,
                        "activities.createdAt": 0,
                        "activities.updatedAt": 0,
                        "activities.__v": 0,
                        "activities.verificationId": 0,
                    },
                },
            ]);

            userProfileInfoResponse[0].interestBasedSkills =
                await appendInteresetBasedSkillsDetails(
                    userProfileInfoResponse[0].interestBasedSkills,
                );

            userProfileInfoResponse[0].workexperiences =
                await appendSkillsDetails(
                    userProfileInfoResponse[0].workexperiences,
                );
            userProfileInfoResponse[0].licensecertifications =
                await appendSkillsDetails(
                    userProfileInfoResponse[0].licensecertifications,
                );
            userProfileInfoResponse[0].projects = await appendSkillsDetails(
                userProfileInfoResponse[0].projects,
            );

            let skillCategoryCounts = {};

            let interestBasedSkills = {};
            userProfileInfoResponse[0].interestBasedSkills.forEach((skill) => {
                interestBasedSkills[skill.skillName] = {
                    skillName: skill.skillName,
                    skillId: skill.skillId,
                    endorsedCount: 0,
                };
                // const skillCategoryId = skill.skillCategoryId;
                // if (!skillCategoryCounts.hasOwnProperty(skillCategoryId)) {
                //     skillCategoryCounts[skillCategoryId] = 0;
                // }
                // skillCategoryCounts[skillCategoryId]++;
            });

            const workExperiences = userProfileInfoResponse[0].workexperiences;
            const licenseCertifications =
                userProfileInfoResponse[0].licensecertifications;
            const projects = userProfileInfoResponse[0].projects;

            let roleBasedSkills = {};

            const extractSkillsAndCountEndorsements = (array) => {
                array.forEach((item) => {
                    item.skills.forEach((skill) => {
                        const { skillName, endorsedBy } = skill;
                        const skillCategoryId = skill.skillCategoryId;
                        if (
                            !skillCategoryCounts.hasOwnProperty(skillCategoryId)
                        ) {
                            skillCategoryCounts[skillCategoryId] = 0;
                        }
                        skillCategoryCounts[skillCategoryId]++;
                        if (interestBasedSkills.hasOwnProperty(skillName)) {
                            if (endorsedBy) {
                                interestBasedSkills[skillName].endorsedCount++;
                            }
                        } else {
                            if (!roleBasedSkills.hasOwnProperty(skillName)) {
                                roleBasedSkills[skillName] = {
                                    skill: skillName,
                                    skillId: skill.skillId,
                                    endorsedCount: 0,
                                };
                            }
                            if (endorsedBy) {
                                roleBasedSkills[skillName].endorsedCount++;
                            }
                        }
                    });
                });
            };

            extractSkillsAndCountEndorsements(
                workExperiences,
                interestBasedSkills,
            );
            extractSkillsAndCountEndorsements(licenseCertifications);
            extractSkillsAndCountEndorsements(projects);

            interestBasedSkills = Object.values(interestBasedSkills);
            roleBasedSkills = Object.values(roleBasedSkills);

            const sortSkillsByEndorsement = (skillsArray) => {
                skillsArray.sort((a, b) => b.endorsedCount - a.endorsedCount);
                return skillsArray;
            };

            interestBasedSkills = sortSkillsByEndorsement(interestBasedSkills);
            roleBasedSkills = sortSkillsByEndorsement(roleBasedSkills);

            const allSkillCategories = await SkillCategory.find({});

            const skillCategoryNameMap = {};
            allSkillCategories.forEach((category) => {
                skillCategoryNameMap[category.skillCategoryId] =
                    category.categoryName;
            });

            let totalCount = 0;
            for (item in skillCategoryCounts) {
                totalCount += skillCategoryCounts[item];
            }

            for (item in skillCategoryCounts) {
                const percentage =
                    (skillCategoryCounts[item] / totalCount) * 100;
                skillCategoryCounts[item] = percentage.toFixed(2);
            }

            const skillCategoryCountsWithName = {};
            Object.keys(skillCategoryCounts).forEach((categoryId) => {
                const categoryName = skillCategoryNameMap[categoryId];
                if (categoryName) {
                    skillCategoryCountsWithName[categoryName] =
                        skillCategoryCounts[categoryId];
                }
            });

            const skillRepository = {
                skillBadges: {
                    roleBasedCount: Object.keys(roleBasedSkills).length,
                    interestBasedCount: Object.keys(interestBasedSkills).length,
                },
                percentages: skillCategoryCountsWithName,
                roleBasedSkills: roleBasedSkills,
                interestBasedSkills: interestBasedSkills,
            };

            userProfileInfoResponse[0].skillRepository = skillRepository;

            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                data: userProfileInfoResponse.length
                    ? userProfileInfoResponse[0]
                    : {},
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.userController.handleGetUserProfileInfoErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateBasicProfile = async (req, res) => {
    try {
        const {
            fullName,
            username,
            dateOfBirth,
            gender,
            mobile,
            email,
            about,
            socialMedia,
        } = req.body;

        // Do Joi validations

        const { userId } = req.userSession;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        userProfile.fullName = fullName;
        userProfile.username = username;
        userProfile.dateOfBirth = dateOfBirth;
        userProfile.gender = gender;
        userProfile.mobile = mobile;
        userProfile.email = email;
        userProfile.about = about;
        userProfile.socialMedia = socialMedia;

        await userProfile.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.PROFILE_UPDATED_SUCCESSFULLY,
            profile: userProfile,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleUpdateBasicProfileErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleAddUserPicture = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        if (user.profilePicture) {
            const parts = user.profilePicture.split("/");
            const fileName = parts[parts.length - 1];
            const imageDeleted = await imageController.removeImageFromS3(
                fileName,
            );
            if (!imageDeleted) {
                return res.status(HttpStatusCode.InternalServerError).json({
                    status: HttpStatusConstant.ERROR,
                    code: HttpStatusCode.InternalServerError,
                    message: ResponseMessageConstant.PROFILE_DELETION_FAILED,
                });
            }
        }

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

        user.profilePicture = imageUrl;
        await user.save();

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.PROFILE_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleUpdateBasicProfileErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
