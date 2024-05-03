// Importing Models
const User = require("../models/user.model");
const Youtube_Course = require("../models/youtube-course.model");
const Daily_Learning = require("../models/daily_learning.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

exports.handleGetUserLearnings = async (req, res) => {
    try {
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
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleGetUserLearningsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateCourseProgress = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const checkIsUserExists = await User.findOne({
            userId,
        });

        if (!checkIsUserExists) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { courseId, videoId, progress } = req.body;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
            "courseProgress.videoId": videoId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const currentDate = new Date().toISOString().split("T")[0];
        const dailyLearning = await Daily_Learning.findOne({
            userId,
            date: currentDate,
        });

        if (!dailyLearning) {
            await Daily_Learning.create({
                userId,
                date: currentDate,
                learned: progress,
            });
        } else {
            dailyLearning.learned += progress;
            dailyLearning.save();
        }

        const progressIndex = youtubeCourse.courseProgress.findIndex(
            (progress) => progress.videoId === videoId,
        );

        if (progressIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_VIDEO_NOT_FOUND,
            });
        }

        let updatedCourse = await Youtube_Course.findOneAndUpdate(
            {
                authorId: userId,
                youtubeCourseId: courseId,
                "courseProgress.videoId": videoId,
            },
            {
                $inc: { "courseProgress.$.progress": progress },
            },
            { new: true },
        );

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message:
                ResponseMessageConstant.COURSE_PROGRESS_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleGetUserLearningsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
