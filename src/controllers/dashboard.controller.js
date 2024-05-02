const Joi = require("joi");
const bcrypt = require("bcryptjs");

// Importing Models
const User = require("../models/user.model");
const jwtToken = require("../models/jwt-token.model");
const verificationToken = require("../models/verification-token.model");
const PasswordResetToken = require("../models/password-reset-token.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");
const { signToken, verifyToken } = require("../helpers/jwt.helper");
const getRecordSignature = require("../helpers/cookie.helper");

// Importing Controllers
const youtubeController = require("./youtube.controller");

const getSkillRepository = async (userId) => {
    try {
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

        let interestBasedSkills = {};
        userProfileInfoResponse[0].interestBasedSkills.forEach((skill) => {
            interestBasedSkills[skill] = { skill: skill, endorsedCount: 0 };
        });

        const workExperiences = userProfileInfoResponse[0].workexperiences;
        const licenseCertifications =
            userProfileInfoResponse[0].licensecertifications;
        const projects = userProfileInfoResponse[0].projects;

        let roleBasedSkills = {};

        const extractSkillsAndCountEndorsements = (array) => {
            array.forEach((item) => {
                item.skills.forEach((skill) => {
                    const { name, endorsedBy } = skill;
                    if (interestBasedSkills.hasOwnProperty(name)) {
                        if (endorsedBy) {
                            interestBasedSkills[name].endorsedCount++;
                        }
                    } else {
                        if (!roleBasedSkills.hasOwnProperty(name)) {
                            roleBasedSkills[name] = {
                                skill: name,
                                endorsedCount: 0,
                            };
                        }
                        if (endorsedBy) {
                            roleBasedSkills[name].endorsedCount++;
                        }
                    }
                });
            });
        };

        extractSkillsAndCountEndorsements(workExperiences);
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

        const skillRepository = {
            interestBasedSkills: interestBasedSkills,
            roleBasedSkills: roleBasedSkills,
        };

        return skillRepository;
    } catch (error) {
        throw error;
    }
};

exports.handleGetDashboard = async (req, res) => {
    try {
        // learning goal
        // learning activites
        // montly performance
        const { userId } = req.userSession;

        const coursesInProgress =
            await youtubeController.handleGetCourseProgress(userId);

        const skillRepository = await getSkillRepository(userId);

        const dashboard = {
            coursesInProgress: coursesInProgress,
            skillRepository: skillRepository,
        };

        res.send(dashboard);
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController.handleGetDashboardErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
