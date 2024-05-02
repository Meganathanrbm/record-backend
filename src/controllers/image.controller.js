const { s3Client } = require("../configs/aws.config");

// Function to upload an image to S3
exports.uploadImageToS3 = async (fileName, file) => {
    try {
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.buffer,
            Key: fileName,
            ContentType: file.mimetype,
        };

        await s3Client.upload(uploadParams).promise();
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error("Error uploading image to S3:", error);
        return null;
    }
};
