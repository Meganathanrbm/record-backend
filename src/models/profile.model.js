const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        userId: String,
        fullName: { type: String, required: false },
        username: String,
        dateOfBirth: { type: String, required: false },
        gender: { type: String, required: false },
        mobile: { type: String, required: false },
        email: String,
        profilePicture: String,
        about: { type: String, required: false },
        socialMedia: {
            linkedin: { type: String, required: false },
            instagram: { type: String, required: false },
            twitter: { type: String, required: false },
            facebook: { type: String, required: false },
            behance: { type: String, required: false },
            personalWebsite: { type: String, required: false },
        },
        educations: [
            {
                degree: { type: String, required: false },
                institution: { type: String, required: false },
                branch: { type: String, required: false },
                rollNumber: { type: String, required: false },
                startMonthYear: { type: String, required: false },
                endMonthYear: { type: String, required: false },
                grade: { type: String, required: false },
                activitiesRoles: { type: String, required: false },
                verified: { type: Boolean, default: false },
                verificationId: { type: String, required: false },
            },
        ],
        workExperiences: [
            {
                role: { type: String, required: false },
                companyName: { type: String, required: false },
                employeeId: { type: String, required: false },
                workType: { type: String, required: false },
                location: { type: String, required: false },
                locationType: { type: String, required: false },
                startDate: { type: Date, required: false },
                endDate: { type: Date, required: false },
                description: { type: String, default: false },
                verified: { type: Boolean, default: false },
                verificationId: { type: String, required: false },
                skills: [
                    {
                        name: { type: String, required: true },
                        verified: { type: Boolean, default: false },
                        endorsedBy: String,
                        endorsedAt: Date,
                    },
                ],
            },
        ],
        licenses_certifications: [
            {
                certificationName: { type: String, required: true },
                organization: { type: String, required: true },
                doneVia: { type: String, required: true },
                issuedDate: { type: Date, required: true },
                expirationDate: { type: Date, required: true },
                credentialId: { type: String, required: true },
                credentialURL: { type: String, required: true },
                verified: { type: Boolean, default: false },
                verificationId: { type: String, required: false },
                skills: [
                    {
                        name: { type: String, required: true },
                        verified: { type: Boolean, default: false },
                        endorsedBy: String,
                        endorsedAt: Date,
                    },
                ],
            },
        ],
        projects: [
            {
                projectName: { type: String, required: true },
                associatedWith: { type: String, required: true },
                projectType: { type: String, required: true },
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                projectLink: { type: String, required: true },
                description: { type: String, required: true },
                verified: { type: Boolean, default: false },
                verificationId: { type: String, required: false },
                skills: [
                    {
                        name: { type: String, required: true },
                        verified: { type: Boolean, default: false },
                        endorsedBy: String,
                        endorsedAt: Date,
                    },
                ],
            },
        ],
    },
    { timestamps: true },
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
