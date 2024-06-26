module.exports = {
    signatureCookieName: "Record-Signature",
    email: {
        charSet: "UTF-8",
        source: {
            tech_team: "Record Team <tech@getrecord.in>",
        },
        verificationEmail: {
            subject: "Record - Email Address Verification Request",
        },
        resetPasswordEmail: {
            subject: "Record - Reset Password Request",
        },
        verificationOfEducation: {
            subject: (name, course) =>
                `Record - Verification of Education for ${name}, ${course}`,
        },
        verificationOfWorkExperience: {
            subject: (name, role, employeeId) =>
                `Record: Verification of employment to ${name}, ${role} (${employeeId})`,
        },
        verificationOfLicenseCertification: {
            subject: (name, certificationName, credentialId) =>
                `Record: Verification of Licenses and Certification of ${name}, ${certificationName} (${credentialId})`,
        },
        verificationOfProject: {
            subject: (name, projectName, projectLink) =>
                `Record: Verification of Project of ${name}, ${projectName} (${projectLink})`,
        },
        verificationOfActivity: {
            subject: (name, activityName, organisation) =>
                `Record: Verification of Project of ${name}, ${activityName} ${organisation}`,
        },
        jobNotification: {
            subject: (companyName, jobDesignation) =>
                `Record: ${companyName} is hiring ${jobDesignation}`,
        },
    },
};
