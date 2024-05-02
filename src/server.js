require("dotenv").config();

const connectDB = require("./configs/mongoose.config");
const { app, server } = require("./app");

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error!! ", error);
            throw error;
        });
        server.listen(PORT, () => {
            console.log(
                `⚡️[server]: Server is running at http://localhost:${PORT} - ${new Date().toDateString()} / ${new Date().toLocaleTimeString()}`,
            );
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed !!! ", error);
    });
