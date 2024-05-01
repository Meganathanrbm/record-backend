const Joi = require("joi");

// Importing models
const WorkExperience = require("../../models/profile/work-experience.model");
const User = require("../../models/user.model");
const Profile_Verification = require("../../models/profile_verification.model");

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

exports.handleAddWorkExperience = async (req, res) => {
    try {
        const {
            role,
            companyName,
            employeeId,
            workType,
            location,
            locationType,
            startDate,
            endDate,
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

        const generatedVerificationId = generateUUID();

        await WorkExperience.create({
            userId,
            workExperienceId: generateUUID(),
            role,
            companyName,
            employeeId,
            workType,
            location,
            locationType,
            startDate,
            endDate,
            description,
            skills,
            verificationId: skipVerification ? null : generatedVerificationId,
        });

        if (!skipVerification) {
            await Profile_Verification.create({
                userId,
                verificationId: generatedVerificationId,
                verifierEmail: verifierEmail,
                verificationType: "work experience",
            });

            const isEmailSend = await handleSendEmail({
                toAddresses: [verifierEmail],
                source: CommonConstant.email.source.tech_team,
                subject:
                    CommonConstant.email.verificationOfWorkExperience.subject(
                        userProfile.username,
                        role,
                        employeeId,
                    ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the work experience details <a href="${process.env.EMAIL_BASE_URL}/verify-work-experience/${generatedVerificationId}">Verfiy Work Experience</a></p>`,
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
                message:
                    ResponseMessageConstant.WORK_EXPERIENCE_ADDED_SUCCESSFULLY,
                data: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleAddWorkExperienceErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateWorkExperience = async (req, res) => {
    try {
        const { userId } = req.userSession;
        const { workExperienceId } = req.params;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const workExperienceToUpdate = await WorkExperience.findOne({
            workExperienceId,
        });

        if (!workExperienceToUpdate) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.WORK_EXPERIENCE_NOT_FOUND,
            });
        }

        const verificationId = workExperienceToUpdate.verificationId;

        const {
            role,
            companyName,
            employeeId,
            workType,
            location,
            locationType,
            startDate,
            endDate,
            description,
            skills,
            verifierEmail,
        } = req.body;

        let skipVerification = false;
        if (!verifierEmail && !verificationId) {
            skipVerification = true;
        }

        const generatedVerificationId = generateUUID();

        workExperienceToUpdate.role = role;
        workExperienceToUpdate.companyName = companyName;
        workExperienceToUpdate.employeeId = employeeId;
        workExperienceToUpdate.workType = workType;
        workExperienceToUpdate.location = location;
        workExperienceToUpdate.locationType = locationType;
        workExperienceToUpdate.startDate = startDate;
        workExperienceToUpdate.endDate = endDate;
        workExperienceToUpdate.description = description;
        workExperienceToUpdate.skills = skills;
        if (!skipVerification && !verificationId) {
            workExperienceToUpdate.verificationId = generatedVerificationId;
        }

        await workExperienceToUpdate.save();

        if (!skipVerification) {
            let toAddressEmail;

            if (!verificationId) {
                toAddressEmail = verifierEmail;
                await Profile_Verification.create({
                    userId,
                    verificationId: generatedVerificationId,
                    verifierEmail: verifierEmail,
                    verificationType: "work experience",
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
                subject:
                    CommonConstant.email.verificationOfWorkExperience.subject(
                        userProfile.username,
                        role,
                        employeeId,
                    ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the work experience details <a href="${process.env.EMAIL_BASE_URL}/verify-work-experience/${generatedVerificationId}">Verfiy Work Experience</a></p>`,
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
                message:
                    ResponseMessageConstant.WORK_EXPERIENCE_UPDATED_SUCCESSFULLY,
                profile: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController
                .handleUpdateWorkExperienceErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
