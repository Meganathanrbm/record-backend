// Importing Models
const User_Engagement = require("../models/user_engagement.model");

// Importing Helpers
const { verifyToken } = require("../helpers/jwt.helper");

exports.handleUserConnected = async (socket) => {
    try {
        if (
            socket.handshake.headers["record-signature"] &&
            socket.handshake.headers["record-signature"] !== "null"
        ) {
            console.log("auth user connected");

            const decodedToken = await verifyToken(
                socket.handshake.headers["record-signature"],
            );

            if (!decodedToken) {
                console.log("Invalid Cookie");
                return;
            }

            const userId = decodedToken.userId;
            const currentDate = new Date().toISOString().split("T")[0];
            const currentTime = Date.now();

            const userEngagement = await User_Engagement.findOne({
                userId,
                date: currentDate,
            });

            if (!userEngagement) {
                console.log("No user engagement found");
                return;
            }

            userEngagement.lastConnected = currentTime;

            userEngagement.save();
        }
    } catch (error) {
        console.error("Error handling user connection:", error);
    }
};

exports.handleUserDisconneted = async (socket) => {
    try {
        if (
            socket.handshake.headers["record-signature"] &&
            socket.handshake.headers["record-signature"] !== "null"
        ) {
            console.log("auth user disconneted");

            const decodedToken = await verifyToken(
                socket.handshake.headers["record-signature"],
            );

            if (!decodedToken) {
                console.log("Invalid Cookie");
                return;
            }

            const userId = decodedToken.userId;
            const currentDate = new Date().toISOString().split("T")[0];
            const currentTime = Date.now();

            const userEngagement = await User_Engagement.findOne({
                userId,
                date: currentDate,
            });

            if (!userEngagement) {
                console.log("No user engagement found");
                return;
            }

            const secDifference =
                (currentTime - userEngagement.lastConnected) / 1000;
            userEngagement.lastDisconnected = currentTime;
            userEngagement.spentSeconds += secDifference;

            userEngagement.save();
        }
    } catch (error) {
        console.error("Error handling user disconnection:", error);
    }
};
