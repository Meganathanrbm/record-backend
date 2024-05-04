const Joi = require("joi");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing Models
const User = require("../models/user.model");
const Institution = require("../models/institution.model");
const Department = require("../models/department.model");
const Staff = require("../models/staff.model");
const Skill = require("../models/skill.model");
const Job = require("../models/job.model");

// Importing Controllers
const handleSendEmail = require("./email.controller");

exports.handleGetPlacementHomePage = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const jobs = await Job.find({ institutionId });

        const organizationData = {};
        const jobRoleData = [];

        // Iterate over each job to calculate counts and oldest postedOn date
        for (const job of jobs) {
            const {
                companyName,
                jobDesignation,
                appliedCount,
                hiredCount,
                postedOn,
            } = job;

            // If the organization doesn't exist in the organizationData object, initialize it
            if (!organizationData[companyName]) {
                organizationData[companyName] = {
                    totalApplied: appliedCount,
                    totalHired: hiredCount,
                    oldestPostedOn: postedOn,
                };
            } else {
                organizationData[companyName].totalApplied += appliedCount;
                organizationData[companyName].totalHired += hiredCount;
                if (postedOn < organizationData[companyName].oldestPostedOn) {
                    organizationData[companyName].oldestPostedOn = postedOn;
                }
            }
            jobRoleData.push({
                companyName,
                role: jobDesignation,
                appliedCount,
                hiredCount,
            });
        }

        const mostHiringOrganisations = Object.entries(organizationData)
            .map(([companyName, data]) => ({
                companyName,
                ...data,
            }))
            .sort((a, b) => b.totalHired - a.totalHired);

        const mostHiringRoles = jobRoleData.sort(
            (a, b) => b.hiredCount - a.hiredCount,
        );

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: {
                mostHiringOrganisations,
                mostHiringRoles,
            },
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.placementController
                .handleGetPlacementHomePageErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetorganisationView = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const { organisationName } = req.params;

        const jobs = await Job.find({
            companyName: organisationName,
            institutionId: institutionId,
        });

        if (jobs.length == 0) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.ORGANISATION_NOT_FOUND,
            });
        }

        let oldestPostedDate = null;
        let totalJobsPosted = 0;
        let totalStudentsHired = 0;
        let totalStudentsApplied = 0;
        const jobDesignationCounts = {};

        const jobsWithCounts = [];

        for (const job of jobs) {
            const jobData = {
                jobId: job.jobId,
                jobDesignation: job.jobDesignation,
                jobLocation: job.jobLocation,
                postedOn: job.postedOn,
                appliedCount: job.appliedCount,
                hiredCount: job.hiredCount,
            };

            // Update total counts
            totalJobsPosted++;
            totalStudentsHired += jobData.hiredCount;
            totalStudentsApplied += jobData.appliedCount;

            if (
                !oldestPostedDate ||
                new Date(job.postedOn) < new Date(oldestPostedDate)
            ) {
                oldestPostedDate = job.postedOn;
            }

            if (job.jobDesignation in jobDesignationCounts) {
                jobDesignationCounts[job.jobDesignation].appliedCount +=
                    job.appliedCount;
                jobDesignationCounts[job.jobDesignation].hiredCount +=
                    job.hiredCount;
            } else {
                jobDesignationCounts[job.jobDesignation] = {
                    appliedCount: job.appliedCount,
                    hiredCount: job.hiredCount,
                };
            }

            jobsWithCounts.push(jobData);
        }

        const mostHiringRoles = Object.entries(jobDesignationCounts)
            .sort(
                ([, countsA], [, countsB]) =>
                    countsB.hiredCount - countsA.hiredCount,
            )
            .map(([designation, counts]) => ({ designation, ...counts }));

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: {
                organisationName,
                oldestPostedDate,
                totalJobsPosted,
                totalStudentsHired,
                totalStudentsApplied,
                mostHiringRoles,
                jobsWithCounts,
            },
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.placementController
                .handleGetorganisationViewErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleCreateJob = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const {
            companyName,
            jobDesignation,
            workplaceType,
            jobLocation,
            jobType,
            openings,
            jobDescription,
            skills,
            departments,
        } = req.body;

        // Do Joi Validations

        const skillsExist = await Promise.all(
            skills.map(async (skillId) => {
                const existingSkill = await Skill.findOne({ skillId });
                return !!existingSkill;
            }),
        );

        const allSkillsExist = skillsExist.every((exists) => exists);

        if (allSkillsExist) {
            const departmentsExist = await Promise.all(
                departments.map(async (departmentId) => {
                    const existingDepartment = await Department.findOne({
                        institutionId,
                        departmentId,
                    });
                    return !!existingDepartment;
                }),
            );

            const allDepartmentsExist = departmentsExist.every(
                (exists) => exists,
            );

            if (allDepartmentsExist) {
                const jobId = generateUUID();
                await Job.create({
                    jobId,
                    institutionId,
                    companyName,
                    jobDesignation,
                    workplaceType,
                    jobLocation,
                    jobType,
                    openings,
                    jobDescription,
                    skills,
                    departments,
                    postedOn: new Date().toISOString().split("T")[0],
                });

                const students = await User.find({
                    departmentId: { $in: departments },
                });

                for (const student of students) {
                    const isEmailSend = await handleSendEmail({
                        toAddresses: [student.email],
                        source: CommonConstant.email.source.tech_team,
                        subject: CommonConstant.email.jobNotification.subject(
                            companyName,
                            jobDesignation,
                        ),
                        htmlData: ` <div class="container">
                                        <div class="header">
                                            <h2>Job Recommendation</h2>
                                        </div>
                                        <div class="content">
                                            <p>
                                                Dear ${student.username},
                                                <br>
                                                Your college is recommending you to apply for the following opportunity:
                                            </p>
                                            <p>
                                                <strong>Company Name:</strong> ${companyName} <br>
                                                <strong>Job Designation:</strong> ${jobDesignation} <br>
                                                <strong>Job Location:</strong> ${jobLocation} <br>
                                                <strong>Openings:</strong> ${openings}
                                            </p>
                                            <p>
                                                <a href="#">Apply Now</a>
                                            </p>
                                        </div>
                                    </div>
                                `,
                    });

                    if (!isEmailSend) {
                        return res
                            .status(HttpStatusCode.InternalServerError)
                            .json({
                                status: HttpStatusConstant.ERROR,
                                code: HttpStatusCode.InternalServerError,
                                message:
                                    ResponseMessageConstant.JOB_NOTIFICATION_EMAIL_SENT_FAILED,
                            });
                    }
                }

                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.JOB_NOTIFICATION_EMAIL_SENT_SUCCESSFULLY,
                });
            } else {
                return res.status(HttpStatusCode.BadRequest).json({
                    status: HttpStatusConstant.BAD_REQUEST,
                    code: HttpStatusCode.BadRequest,
                    message: ResponseMessageConstant.DEPARTMENT_NOT_FOUND,
                });
            }
        } else {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: ResponseMessageConstant.INVALID_SKILLS,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.placementController.handleCreateJobErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetJob = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const { jobId } = req.params;

        const job = await Job.findOne({ jobId, institutionId }).select(
            "-_id -createdAt -updatedAt -__v -departments",
        );

        if (!job) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.JOB_NOT_FOUND,
            });
        }

        const skills = await Skill.find({
            skillId: { $in: job.skills },
        }).select("skillName");

        const jobWithSkillNames = {
            ...job.toObject(),
            skills: skills.map((skill) => skill.skillName),
        };

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: jobWithSkillNames,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.placementController.handleGetJobErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleCloseJob = async (req, res) => {};
