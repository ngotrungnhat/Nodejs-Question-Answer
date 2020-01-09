import DataUtils from "../utils/data_utils"
import ApiError from "../commons/response_models/api_error"
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts"
import ErrorResponse from "../commons/response_models/error_response"
import SuccessResponse from "../commons/response_models/success_response"
import UserService from "../services/user_service"
import omit from "object.omit"
import BaseController from "./base_controller"
import RequestUtils from "../utils/request_utils"
import { isNumber } from "util"

class UserController extends BaseController {
    constructor() {
        super(new UserService())
        this.createNormalUser = this.createNormalUser.bind(this)
        this._validateRequestBodyForCreateNormalUser = this._validateRequestBodyForCreateNormalUser.bind(this)
        this.changePasswordOfNormalUser = this.changePasswordOfNormalUser.bind(this)
        this._validateRequestBodyForChangePasswordOfNormalUser = this._validateRequestBodyForChangePasswordOfNormalUser.bind(this)
        this.updateProfileOfNormalUser = this.updateProfileOfNormalUser.bind(this)
        this._validateRequestBodyForUpdateProfileOfNormalUser = this._validateRequestBodyForUpdateProfileOfNormalUser.bind(this)
        this.forgotPasswordOfNormalUser = this.forgotPasswordOfNormalUser.bind(this)
        this._validateBodyForForgotPasswordOfNormalUser = this._validateBodyForForgotPasswordOfNormalUser.bind(this)
        this.updatePasswordByCodeOfNormalUser = this.updatePasswordByCodeOfNormalUser.bind(this)
        this._validateRequestBodyForUpdatePasswordByCode = this._validateRequestBodyForUpdatePasswordByCode.bind(this)
        this.activeNormalUser = this.activeNormalUser.bind(this)
        this._validateRequestBodyForActiveNormalUser = this._validateRequestBodyForActiveNormalUser.bind(this)
        this.sendActiveUserCode = this.sendActiveUserCode.bind(this)
        this._validateRequestBodyForSendActiveUserCode = this._validateRequestBodyForSendActiveUserCode.bind(this)
        this.getMyProfile = this.getMyProfile.bind(this)
    }

    async createNormalUser(req, res, next) {
        const requestBody = req.body
        try {
            this._validateRequestBodyForCreateNormalUser(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        const user = await this.service.createNormalUser(requestBody)
        const data = omit(user.toJSON(), ["_id", "type", "createdAt", "updatedAt", "activeCode", "isActive", "password", "changePasswordCode"])
        const responseBody = new SuccessResponse(undefined, undefined, data)
        return res.status(ResponseCode.CREATED).json(responseBody)
    }

    _validateRequestBodyForCreateNormalUser(requestBody) {
        const errors = []
        const { email, password, firstName, lastName } = requestBody
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid email", LocationType.BODY, "/email"))
        }
    
        if (!DataUtils.isHasValue(password) || !DataUtils.isValidPassword(password)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid password", LocationType.BODY, "/password"))
        }
    
        if (!DataUtils.isHasValue(firstName) || !DataUtils.isValidName(firstName)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid name", LocationType.BODY, "/firstName"))
        }
    
        if (!DataUtils.isHasValue(lastName) || !DataUtils.isValidName(lastName)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid name", LocationType.BODY, "/lastName"))
        }
    
        if (errors.length) {
            throw errors
        }
    }

    async changePasswordOfNormalUser(req, res, next) {
        const email = req.decodedToken.email
        const requestBody = req.body
        const { currentPassword, newPassword } = requestBody
    
        try {
            this._validateRequestBodyForChangePasswordOfNormalUser(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        await this.service.changePasswordOfNormalUser(email, currentPassword, newPassword)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateRequestBodyForChangePasswordOfNormalUser(requestBody) {
        const errors = []
        const { currentPassword, newPassword } = requestBody
    
        if (!DataUtils.isHasValue(currentPassword) || !DataUtils.isValidPassword(currentPassword)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid password`, LocationType.BODY, "/currentPassword"))
        }
    
        if (!DataUtils.isHasValue(newPassword) || !DataUtils.isValidPassword(newPassword)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid password`, LocationType.BODY, "/newPassword"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    async updateProfileOfNormalUser(req, res, next) {
        const email = req.decodedToken.email
        const requestBody = req.body
    
        try {
            this._validateRequestBodyForUpdateProfileOfNormalUser(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        await this.service.updateProfileOfNormalUser(email, requestBody)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateRequestBodyForUpdateProfileOfNormalUser(requestBody) {
        const errors = []
        const { firstName, lastName, company, location, age, aboutMe } = requestBody
    
        if (DataUtils.isHasValue(firstName) && !DataUtils.isValidName(firstName)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid name`, LocationType.BODY, "/firstName"))
        }
    
        if (DataUtils.isHasValue(lastName) && !DataUtils.isValidName(lastName)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid name`, LocationType.BODY, "/lastName"))
        }

        if (DataUtils.isHasValue(company) && !DataUtils.isValidCommonText(company)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid company`, LocationType.BODY, "/company"))
        }

        if (DataUtils.isHasValue(location) && !DataUtils.isValidCommonText(location)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid location`, LocationType.BODY, "/location"))
        }

        if (DataUtils.isHasValue(age) && (!isNumber(age)) || age <= 0 || age > 120) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid age`, LocationType.BODY, "/age"))
        }

        if (DataUtils.isHasValue(aboutMe) && !DataUtils.isValidCommonText(aboutMe)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid aboutMe`, LocationType.BODY, "/aboutMe"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    async forgotPasswordOfNormalUser(req, res, next) {
        const requestBody = req.body
    
        try {
            this._validateBodyForForgotPasswordOfNormalUser(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        const { email } = requestBody
        await this.service.forgotPasswordOfNormalUser(email)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateBodyForForgotPasswordOfNormalUser(requestBody) {
        const errors = []
        const { email } = requestBody
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid email`, LocationType.BODY, "/email"))
        }
    
        if (errors.length) {
            return errors
        }
    }
    
    async updatePasswordByCodeOfNormalUser(req, res, next) {
        const requestBody = req.body
        const { email, code, password } = requestBody
    
        try {
            this._validateRequestBodyForUpdatePasswordByCode(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        await this.service.updatePasswordByCodeOfNormalUser(email, code, password)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateRequestBodyForUpdatePasswordByCode(requestBody) {
        const errors = []
        const { email, code, password } = requestBody
    
        if (!DataUtils.isHasValue(code)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid code`, LocationType.BODY, "/code"))
        }
    
        if (!DataUtils.isHasValue(password) || !DataUtils.isValidPassword(password)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid password`, LocationType.BODY, "/password"))
        }
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid email`, LocationType.BODY, "/email"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    async activeNormalUser(req, res, next) {
        const requestBody = req.body
        const { email, code } = requestBody
    
        try {
            this._validateRequestBodyForActiveNormalUser(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        await this.service.activeNormalUser(email, code)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateRequestBodyForActiveNormalUser(requestBody) {
        const errors = []
        const { email, code } = requestBody
    
        if (!DataUtils.isHasValue(code)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid code`, LocationType.BODY, "/code"))
        }
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid email`, LocationType.BODY, "/email"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    async sendActiveUserCode(req, res, next) {
        const requestBody = req.body
        const { email } = requestBody
    
        try {
            this._validateRequestBodyForSendActiveUserCode(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        await this.service.sendActiveUserCode(email)
    
        return res.status(ResponseCode.NO_CONTENT).send()
    }
    
    _validateRequestBodyForSendActiveUserCode(requestBody) {
        const errors = []
        const { email } = requestBody
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid email`, LocationType.BODY, "/email"))
        }
    
        if (errors.length) {
            throw errors
        }
    }

    async getMyProfile(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req)

        const user = await this.service.getUserProfileById(userId)

        const responseBody = new SuccessResponse(undefined, undefined, omit(user.toJSON(), ["password", "activeCode", "changePasswordCode", "updatedAt", "isActive", "type"]))
        return res.status(ResponseCode.OK).json(responseBody)
    }
}

export default UserController