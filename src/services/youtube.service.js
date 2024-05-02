const axios = require("axios");

// Importing constants
const ServicePathConstant = require("../constants/service-path.constant");

exports.handleGetYoutubePlaylistItems = async (playlistId) => {
    try {
        const response = await axios.get(
            ServicePathConstant.youtube.getPlaylistItems({
                playlistId,
                apiKey: process.env.YOUTUBE_API_KEY,
            }),
        );
        return response.data;
    } catch (err) {
        const errorMessage = `Error fetching playlist items: ${err.message}`;
        throw new Error(errorMessage);
    }
};

exports.handleGetYoutubePlaylistDetails = async (playlistId) => {
    try {
        const response = await axios.get(
            ServicePathConstant.youtube.getPlaylistDetails({
                id: playlistId,
                apiKey: process.env.YOUTUBE_API_KEY,
            }),
        );
        return response.data;
    } catch (err) {
        const errorMessage = `Error fetching playlist details: ${err.message}`;
        throw new Error(errorMessage);
    }
};

exports.handleGetVideoDetails = async (videoId) => {
    try {
        const response = await axios.get(
            ServicePathConstant.youtube.getVideoDetails({
                videoId,
                apiKey: process.env.YOUTUBE_API_KEY,
            }),
        );
        return response.data;
    } catch (err) {
        const errorMessage = `Error fetching video details: ${err.message}`;
        throw new Error(errorMessage);
    }
};
