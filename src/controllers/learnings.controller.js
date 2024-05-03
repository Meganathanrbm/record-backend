// Importing Models
const User = require("../models/user.model");
const Youtube_Course = require("../models/youtube-course.model");
const Daily_Learning = require("../models/daily_learning.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Utils
const { getStartAndEndDate } = require("../utils/date.util");

exports.handleGetUserLearnings = async (req, res) => {
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

        const youtubeCourses = await Youtube_Course.find({ authorId: userId });

        const myLearnings = [];
        const pipeline = [];
        const completed = [];

        for (const course of youtubeCourses) {
            let totalProgress = 0;
            let totalDuration = 0;

            course.courseProgress.forEach((video) => {
                totalProgress += video.progress;
                totalDuration += video.duration;
            });

            const progress = Math.round((totalProgress / totalDuration) * 100);

            const localCourse = {};

            localCourse.youtubeCourseId = course.youtubeCourseId;
            localCourse.authorId = course.authorId;
            localCourse.playlistId = course.playlistId;
            localCourse.progress = progress;
            localCourse.courseMetaData = course.courseMetaData;

            if (totalProgress === totalDuration) {
                completed.push(localCourse);
            } else if (totalProgress === 0) {
                pipeline.push(localCourse);
            } else {
                myLearnings.push(localCourse);
            }
        }

        const userGoalType = user.goalType;
        const userGoalHours = user.goalHours;

        const currentDate = new Date().toISOString().split("T")[0];
        const startEndDates = getStartAndEndDate(currentDate);

        let userLearningHours = 0;
        if (userGoalType === "week") {
            const weeklyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.weekStart,
                    $lte: startEndDates.weekEnd,
                },
            });
            userLearningHours = weeklyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        } else if (userGoalType === "month") {
            const monthlyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.monthStart,
                    $lte: startEndDates.monthEnd,
                },
            });
            userLearningHours = monthlyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        } else if (userGoalType === "year") {
            const yearlyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.yearStart,
                    $lte: startEndDates.yearEnd,
                },
            });
            userLearningHours = yearlyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        }
        const goal = {
            goalType: userGoalType,
            goalTarget: userGoalHours,
            goalDone: Math.round(userLearningHours / 3600),
            goalDonePercentage: Math.round(
                (userLearningHours / 3600 / userGoalHours) * 100,
            ),
        };

        const myLearningsResponse = {
            goal: goal,
            myLearnings: myLearnings,
            pipeline: pipeline,
            completed: completed,
        };

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: myLearningsResponse,
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

        const duration = youtubeCourse.courseProgress[progressIndex].duration;
        const courseProgress =
            youtubeCourse.courseProgress[progressIndex].progress;

        let updatedCourse;

        if (courseProgress + progress >= duration) {
            updatedCourse = await Youtube_Course.findOneAndUpdate(
                {
                    authorId: userId,
                    youtubeCourseId: courseId,
                    "courseProgress.videoId": videoId,
                },
                {
                    $set: {
                        "courseProgress.$.progress": duration,
                        "courseProgress.$.isCompleted": true,
                    },
                },
                { new: true },
            );
        } else {
            updatedCourse = await Youtube_Course.findOneAndUpdate(
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
        }

        let totalProgress = 0;
        let totalDuration = 0;

        for (const video of updatedCourse.courseProgress) {
            totalProgress += video.progress;
            totalDuration += video.duration;
        }

        if (totalProgress >= totalDuration) {
            await Youtube_Course.findOneAndUpdate(
                { authorId: userId, youtubeCourseId: courseId },
                { $set: { isCompleted: true } },
                { new: true },
            );
        }

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

exports.handleGetCourse = async (req, res) => {
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

        const { courseId } = req.params;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const courseContentToSend = youtubeCourse.courseContent.map(
            (content) => ({
                videoTitle: content.snippet.title,
                description: content.snippet.description,
                thumbnails: content.snippet.thumbnails,
                position: content.snippet.position,
                videoId: content.snippet.resourceId.videoId,
            }),
        );

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.SUCCESS,
            courseContent: courseContentToSend,
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

exports.handleSetLearningGoal = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { goalType, goalHours } = req.body;

        user.goalType = goalType;
        user.goalHours = goalHours;
        user.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.GOAL_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleSetLearningGoalErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleAddNotes = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { courseId, videoId, videoTime, notes } = req.body;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const courseNotesIndex = youtubeCourse.courseNotes.findIndex(
            (note) => note.videoId === videoId,
        );

        if (courseNotesIndex === -1) {
            youtubeCourse.courseNotes.push({
                videoId,
                notes: [
                    {
                        text: notes,
                        time: new Date(),
                        videoTime,
                    },
                ],
            });
        } else {
            const existingNote = youtubeCourse.courseNotes[
                courseNotesIndex
            ].notes.find((note) => note.videoTime === videoTime);

            if (existingNote) {
                return res.status(HttpStatusCode.BadRequest).json({
                    status: HttpStatusConstant.BAD_REQUEST,
                    code: HttpStatusCode.BadRequest,
                    message: ResponseMessageConstant.NOTES_ALREADY_PRESENT,
                });
            }

            youtubeCourse.courseNotes[courseNotesIndex].notes.push({
                text: notes,
                time: new Date(),
                videoTime: videoTime,
            });
        }

        await youtubeCourse.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.NOTES_ADDED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleAddNotes,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetNotes = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { courseId, videoId, videoTime, notes } = req.body;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const courseNotesIndex = youtubeCourse.courseNotes.findIndex(
            (note) => note.videoId === videoId,
        );

        if (courseNotesIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.NOTES_NOT_FOUND,
            });
        }

        const notesForVideo = youtubeCourse.courseNotes[courseNotesIndex].notes;

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.SUCCESS,
            notes: notesForVideo,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleAddNotesErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateNotes = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { courseId, videoId, videoTime, notes } = req.body;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const courseNotesIndex = youtubeCourse.courseNotes.findIndex(
            (note) => note.videoId === videoId,
        );

        if (courseNotesIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.NOTES_NOT_FOUND,
            });
        }

        const existingNoteIndex = youtubeCourse.courseNotes[
            courseNotesIndex
        ].notes.findIndex((note) => note.videoTime === videoTime);

        if (existingNoteIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.NOTES_NOT_FOUND,
            });
        }

        youtubeCourse.courseNotes[courseNotesIndex].notes[
            existingNoteIndex
        ].text = notes;
        youtubeCourse.courseNotes[courseNotesIndex].notes[
            existingNoteIndex
        ].time = new Date();

        await youtubeCourse.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.NOTES_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleUpdateNotesErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleDeleteNotes = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const { courseId, videoId, videoTime } = req.body;

        const youtubeCourse = await Youtube_Course.findOne({
            authorId: userId,
            youtubeCourseId: courseId,
        });

        if (!youtubeCourse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        const courseNotesIndex = youtubeCourse.courseNotes.findIndex(
            (note) => note.videoId === videoId,
        );

        if (courseNotesIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.NOTES_NOT_FOUND,
            });
        }

        const existingNoteIndex = youtubeCourse.courseNotes[
            courseNotesIndex
        ].notes.findIndex((note) => note.videoTime === videoTime);

        if (existingNoteIndex === -1) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.NOTES_NOT_FOUND,
            });
        }

        youtubeCourse.courseNotes[courseNotesIndex].notes.splice(
            existingNoteIndex,
            1,
        );

        await youtubeCourse.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.NOTES_DELETED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.learningsController.handleDeleteNotesErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
