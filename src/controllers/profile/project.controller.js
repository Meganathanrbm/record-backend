const Joi = require("joi");

// Importing models
const Project = require("../../models/profile/project.model");
const User = require("../../models/user.model");
const Profile_Verification = require("../../models/profile_verification.model");
const Skill = require("../../models/skill.model");

// Importing Constants
const HttpStatusConstant = require("../../constants/http-message.constant");
const HttpStatusCode = require("../../constants/http-code.constant");
const ResponseMessageConstant = require("../../constants/response-message.constant");
const CommonConstant = require("../../constants/common.constant");
const ErrorLogConstant = require("../../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../../helpers/uuid.helper");

// Importing Controllers
const handleSendEmail = require("../email.controller");

exports.handleAddProject = async (req, res) => {
    try {
        const {
            projectName,
            associatedWith,
            projectType,
            startDate,
            endDate,
            projectLink,
            description,
            skills,
            verifierEmail,
        } = req.body;

        // Do Joi Validation

        let skipVerification = false;
        if (!verifierEmail) {
            skipVerification = true;
        }

        const { userId } = req.userSession;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const skillIds = req.body.skills.map((skill) => skill.skillId);

        const skillsExist = await Promise.all(
            skillIds.map(async (skillId) => {
                const existingSkill = await Skill.findOne({ skillId });
                return !!existingSkill;
            }),
        );

        const allSkillsExist = skillsExist.every((exists) => exists);

        if (!allSkillsExist) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: ResponseMessageConstant.INVALID_SKILLS,
            });
        }

        const generatedVerificationId = generateUUID();

        await Project.create({
            userId,
            projectId: generateUUID(),
            projectName,
            associatedWith,
            projectType,
            startDate,
            endDate,
            projectLink,
            description,
            skills,
            verifierEmail,
            verificationId: skipVerification ? null : generatedVerificationId,
        });

        if (!skipVerification) {
            await Profile_Verification.create({
                userId,
                verificationId: generatedVerificationId,
                verifierEmail: verifierEmail,
                verificationType: "project",
            });

            const isEmailSend = await handleSendEmail({
                toAddresses: [verifierEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfProject.subject(
                    userProfile.username,
                    projectName,
                    projectLink,
                ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the Project details <a href="${process.env.EMAIL_BASE_URL}/verify-project/${generatedVerificationId}">Verfiy Project</a></p>`,
            });

            if (isEmailSend) {
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_SUCCESSFULLY,
                    data: userProfile,
                });
            } else {
                return res.status(HttpStatusCode.InternalServerError).json({
                    status: HttpStatusConstant.ERROR,
                    code: HttpStatusCode.InternalServerError,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_FAILED,
                });
            }
        } else {
            return res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.PROJECT_ADDED_SUCCESSFULLY,
                data: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleAddProjectErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateProject = async (req, res) => {
    try {
        const { userId } = req.userSession;
        const { projectId } = req.params;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const projectToUpdate = await Project.findOne({ projectId });

        if (!projectToUpdate) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.PROJECT_NOT_FOUND,
            });
        }

        const skillIds = req.body.skills.map((skill) => skill.skillId);

        const skillsExist = await Promise.all(
            skillIds.map(async (skillId) => {
                const existingSkill = await Skill.findOne({ skillId });
                return !!existingSkill;
            }),
        );

        const allSkillsExist = skillsExist.every((exists) => exists);

        if (!allSkillsExist) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: ResponseMessageConstant.INVALID_SKILLS,
            });
        }

        const verificationId = projectToUpdate.verificationId;

        const {
            projectName,
            associatedWith,
            projectType,
            startDate,
            endDate,
            projectLink,
            description,
            skills,
            verifierEmail,
        } = req.body;

        let skipVerification = false;
        if (!verifierEmail && !verificationId) {
            skipVerification = true;
        }

        const generatedVerificationId = generateUUID();

        projectToUpdate.projectName = projectName;
        projectToUpdate.associatedWith = associatedWith;
        projectToUpdate.projectType = projectType;
        projectToUpdate.projectType = projectType;
        projectToUpdate.startDate = startDate;
        projectToUpdate.endDate = endDate;
        projectToUpdate.projectLink = projectLink;
        projectToUpdate.description = description;
        projectToUpdate.skills = skills;
        if (!skipVerification && !verificationId) {
            projectToUpdate.verificationId = generatedVerificationId;
        }

        await projectToUpdate.save();

        if (!skipVerification) {
            let toAddressEmail;

            if (!verificationId) {
                toAddressEmail = verifierEmail;
                await Profile_Verification.create({
                    userId,
                    verificationId: generatedVerificationId,
                    verifierEmail: verifierEmail,
                    verificationType: "project",
                });
            } else {
                const profileVerificationResponse =
                    await Profile_Verification.findOne({ verificationId });
                // handle if profile verification response not found
                toAddressEmail = profileVerificationResponse.verifierEmail;
            }

            const isEmailSend = await handleSendEmail({
                toAddresses: [toAddressEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfProject.subject(
                    userProfile.username,
                    projectName,
                    projectLink,
                ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the Project details <a href="${process.env.EMAIL_BASE_URL}/verify-project/${generatedVerificationId}">Verfiy Project</a></p>`,
            });

            if (isEmailSend) {
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_SUCCESSFULLY,
                    data: userProfile,
                });
            } else {
                return res.status(HttpStatusCode.InternalServerError).json({
                    status: HttpStatusConstant.ERROR,
                    code: HttpStatusCode.InternalServerError,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_FAILED,
                });
            }
        } else {
            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.SUCCESS,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.PROJECT_ADDED_SUCCESSFULLY,
                profile: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleUpdateProjectErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
