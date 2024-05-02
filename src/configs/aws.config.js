const s3 = require("aws-sdk/clients/s3");
const ses = require("aws-sdk/clients/ses");

exports.s3Client = new s3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

exports.sesClient = new ses({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SECRET,
    },
});
