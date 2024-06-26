const Joi = require("joi");
const { parse, toSeconds } = require("iso8601-duration");

// Importing models
const Youtube_Course = require("../models/youtube-course.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing services
const youtubeService = require("../services/youtube.service");

// Importing utils
const commonUtils = require("../utils/common.util");

exports.handleCreateYouTubeCourse = async (req, res) => {
    try {
        const { youtubePlayListUrl } = req.body;

        const { userId } = req.userSession;

        const youtubePlayListValidation = Joi.object({
            youtubePlayListUrl: Joi.string().required(),
        });

        const { error } = youtubePlayListValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const playlistId = commonUtils.extractPlaylistId(youtubePlayListUrl);

        if (!playlistId) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.BadRequest,
            });
        }

        const isPlaylistIdExists = await Youtube_Course.exists({
            authorId: userId,
            playlistId,
        });

        if (isPlaylistIdExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.PLAYLIST_ALREADY_EXISTS,
            });
        }

        const youtubePlaylistItemsResponse =
            await youtubeService.handleGetYoutubePlaylistItems(playlistId);

        const youtubePlaylistDetailsResponse =
            await youtubeService.handleGetYoutubePlaylistDetails(playlistId);

        const videoIds = youtubePlaylistItemsResponse.items.map(
            (item) => item.snippet.resourceId.videoId,
        );

        const videoDetailsResponses = await Promise.all(
            videoIds.map((videoId) =>
                youtubeService.handleGetVideoDetails(videoId),
            ),
        );

        const courseProgress = youtubePlaylistItemsResponse.items.map(
            (item, index) => {
                const durationString =
                    videoDetailsResponses[index].items[0].contentDetails
                        .duration;
                const durationObject = parse(durationString);
                const totalSeconds = toSeconds(durationObject);
                return {
                    videoId: item.snippet.resourceId.videoId,
                    duration: totalSeconds,
                    progress: 0,
                    lastStopped: 0,
                    isCompleted: false,
                };
            },
        );

        const youtubeCoursePayload = {
            youtubeCourseId: generateUUID(),
            playlistId,
            authorId: userId,
            courseMetaData:
                youtubePlaylistDetailsResponse.items.length > 0
                    ? youtubePlaylistDetailsResponse.items[0].snippet
                    : null,
            courseContent: youtubePlaylistItemsResponse.items,
            courseProgress,
        };

        const youtubeCourseCreationResponse = await Youtube_Course.create(
            youtubeCoursePayload,
        );

        res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Created,
            data: youtubeCourseCreationResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.youtubeController
                .handleCreateYouTubeCourseErrorLog,
            error.message,
        );
        if (error.response) {
            res.status(error.response.status).json({
                status: HttpStatusConstant.ERROR,
                code: error.response.status,
                message: error.response.data.message,
            });
        } else {
            res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
            });
        }
    }
};

exports.handleGetAllNotStartedCoursesByUserId = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const youtubeCourseResponse = await Youtube_Course.find({
            authorId: userId,
        });

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            data: youtubeCourseResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.youtubeController
                .handleGetAllNotStartedCoursesByUserIdErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.userSession;

        const courseIdValidation = Joi.object({
            courseId: Joi.string().required(),
        });

        const { error } = courseIdValidation.validate(req.params);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const youtubeCourseResponse = await Youtube_Course.findOne({
            youtubeCourseId: courseId,
            authorId: userId,
        }).select("-_id -__v");

        if (!youtubeCourseResponse) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.COURSE_NOT_FOUND,
            });
        }

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            data: youtubeCourseResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.youtubeController.handleGetCourseDetailsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleDeleteCourseByCourseId = async (req, res) => {
    try {
    } catch (error) {}
};

exports.handleGetCourseProgress = async (userId) => {
    try {
        const youtubeCourses = await Youtube_Course.find({ authorId: userId });
        const coursesInProgress = youtubeCourses
            .map((course) => {
                let totalDuration = 0;
                let totalProgress = 0;
                for (const video of course.courseProgress) {
                    totalDuration += video.duration;
                    totalProgress += video.progress;
                }
                const progress = Math.round(
                    (totalProgress / totalDuration) * 100,
                );
                if (totalProgress > 0) {
                    return {
                        _id: course._id,
                        youtubeCourseId: course.youtubeCourseId,
                        authorId: course.authorId,
                        playlistId: course.playlistId,
                        isCompleted: course.isCompleted,
                        courseProgress: progress,
                        courseMetaData: course.courseMetaData,
                    };
                } else {
                    return null; // Return null for courses with zero progress
                }
            })
            .filter((course) => course !== null);
        return coursesInProgress;
    } catch (error) {
        console.log(
            ErrorLogConstant.youtubeController.handleGetCourseProgressErrorLog,
            error.message,
        );
        throw error;
    }
};
