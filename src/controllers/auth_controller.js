import DataUtils from "../utils/data_utils"
import ApiError from "../commons/response_models/api_error"
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts"
import ErrorResponse from "../commons/response_models/error_response"
import SuccessResponse from "../commons/response_models/success_response"
import AuthService from "../services/auth_service"
import { UserType } from "../commons/consts/user_consts"

const authService = new AuthService()

export const authenticateNormalUser = async (req, res, next) => {
    const requestBody = req.body
    try {
        validateRequestBodyForNormalUserAuthenticate(requestBody)
    } catch (errors) {
        const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
        return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
    }

    const data = await authService.authenticateNormalUser(requestBody)
    const responseBody = new SuccessResponse(undefined, undefined, data)
    return res.status(ResponseCode.OK).json(responseBody)
}

const validateRequestBodyForNormalUserAuthenticate = (requestBody) => {
    const errors = []
    const { email, password } = requestBody

    if (!DataUtils.isHasValue(email)) {
        errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Email is required", LocationType.BODY, "/email"))
    }

    if (!DataUtils.isHasValue(password)) {
        errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Password is required", LocationType.BODY, "/password"))
    }

    if (errors.length) {
        throw errors
    }
}

export const authenticateFBUser = async (req, res, next) => {
    const requestBody = req.body

    try {
        validateRequestBodyForSSOUserAuthenticate(requestBody)
    } catch (errors) {
        const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
        return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
    }

    const data = await authService.authenticateSSOUser(requestBody, UserType.FB_USER)
    const responseBody = new SuccessResponse(undefined, undefined, data)
    return res.status(ResponseCode.OK).json(responseBody)
}

export const authenticateGGUser = async (req, res, next) => {
    const requestBody = req.body

    try {
        validateRequestBodyForSSOUserAuthenticate(requestBody)
    } catch (errors) {
        const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
        return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
    }

    const data = await authService.authenticateSSOUser(requestBody, UserType.GG_USER)
    const responseBody = new SuccessResponse(undefined, undefined, data)
    return res.status(ResponseCode.OK).json(responseBody)
}

const validateRequestBodyForSSOUserAuthenticate = (requestBody) => {
    const errors = []
    const { email, phoneNumber, firstName, lastName } = requestBody

    if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
        errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid email", LocationType.BODY, "/email"))
    }

    if (DataUtils.isHasValue(firstName) && !DataUtils.isValidName(firstName)) {
        errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid first name", LocationType.BODY, "/firstName"))
    }

    if (DataUtils.isHasValue(lastName) && !DataUtils.isValidName(lastName)) {
        errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid last name", LocationType.BODY, "/lastName"))
    }

    if (errors.length) {
        throw errors
    }
}