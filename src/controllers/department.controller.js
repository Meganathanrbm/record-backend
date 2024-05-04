const Joi = require("joi");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing Models
const User = require("../models/user.model");
const Institution = require("../models/institution.model");
const Department = require("../models/department.model");
const Staff = require("../models/staff.model");

exports.handleAddDepartment = async (req, res) => {
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

        const { name, programType, programDuration } = req.body;

        const checkDepartmentExists = await Department.findOne({ name });

        if (checkDepartmentExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.DEPARTMENT_ALREADY_EXISTS,
            });
        }

        const departmentId = generateUUID();

        const department = await Department.create({
            institutionId,
            departmentId,
            ...req.body,
        });

        return res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.CREATED,
            code: HttpStatusCode.Created,
            data: department,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.departmentController.handleAddDepartmentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const department = await Department.findOne({ departmentId });

        if (!department) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.DEPARTMENT_NOT_FOUND,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: department,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.departmentController.handleGetDepartmentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetAllDepartment = async (req, res) => {
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

        const departments = await Department.find({ institutionId });

        const departmentsWithStudentCount = await Promise.all(
            departments.map(async (department) => {
                if (department.name === "Administrative") {
                    return;
                }
                const departmentObject = department.toObject();
                delete departmentObject.createdAt;
                delete departmentObject.updatedAt;
                delete departmentObject.__v;

                const studentsCount = await User.countDocuments({
                    institutionId,
                    departmentId: departmentObject.departmentId,
                });
                departmentObject.totalStudents = studentsCount;

                return departmentObject;
            }),
        );

        const filteredDepartments = departmentsWithStudentCount.filter(
            (department) => department,
        );

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: filteredDepartments,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.departmentController
                .handleGetAllDepartmentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const department = await Department.findOne({ departmentId });

        if (!department) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.DEPARTMENT_NOT_FOUND,
            });
        }

        const { name, programType, programDuration } = req.body;

        department.name = name;
        department.programType = programType;
        department.programDuration = programDuration;

        await department.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.DEPARTMENT_UPDATED_SUCCESSFULLY,
            profile: department,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.departmentController
                .handleUpdateDepartmentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
