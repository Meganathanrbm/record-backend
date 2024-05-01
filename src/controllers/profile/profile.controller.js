const Joi = require("joi");

// Importing models
const User = require("../../models/user.model");

// Importing Constants
const HttpStatusConstant = require("../../constants/http-message.constant");
const HttpStatusCode = require("../../constants/http-code.constant");
const ResponseMessageConstant = require("../../constants/response-message.constant");
const ErrorLogConstant = require("../../constants/error-log.constant");

exports.handleGetUserProfileInfo = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: ResponseMessageConstant.USER_ID_REQUIRED,
            });
        }

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
            ]);

            const interestBasesSkills =
                userProfileInfoResponse.interestBasedSkills;
            console.log(interestBasesSkills);

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
            ErrorLogConstant.userController.handleUpdateUsernameErrorLog,
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
