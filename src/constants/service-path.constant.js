module.exports = {
    youtube: {
        getPlaylistItems: ({ playlistId, apiKey }) =>
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
        getPlaylistDetails: ({ id, apiKey }) =>
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${id}&key=${apiKey}`,
        getVideoDetails: ({ videoId, apiKey }) =>
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`,
    },
};
