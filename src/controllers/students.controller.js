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

exports.handleGetStudentProfile = async (req, res) => {
    try {
        const { stundetId } = req.params;

        const student = await User.findOne({ userId: stundetId });
        if (!student) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STUDENT_NOT_FOUND,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.studentsController.handleGetStudentProfileErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
