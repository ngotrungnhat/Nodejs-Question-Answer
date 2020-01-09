import UserDAO from "../daos/user_dao"
import CommonError from "../commons/errors/common_error"
import ApiError from "../commons/response_models/api_error"
import { ErrorCode, ErrorMessage, LocationType, ResponseCode, ResponseBodyCode } from "../commons/consts/response_consts"
import VoteableService from "./voteable_service"
import DataUtils from "../utils/data_utils"
import DateTimeUtils from "../utils/date_time_utils"
import EmailUtils from "../utils/email_utils"
import config from "../utils/config"

class UserService extends VoteableService {
    constructor() {
        super(new UserDAO())
    }

    async createNormalUser(userData) {
        const { email } = userData
        const user = await this.dao.getUserByEmail(email)

        if (user) {
            throw new CommonError(ResponseCode.CONFLICT, undefined, "This email already exists!")
        }

        const activeCode = DataUtils.randomKey(3)
        const currentMsTime = DateTimeUtils.getCurrentMsTime()

        const insertedUser = await this.dao.insertRecord(Object.assign(userData, { activeCode: { code: activeCode, createdAt: currentMsTime } }))

        setTimeout(this.sendNewUserEmail, 1000, insertedUser, activeCode)

        return insertedUser
    }

    async changePasswordOfNormalUser(email, currentPassword, newPassword) {
        const user = await this.dao.getUserByEmail(email)

        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This email does not exists!")
        }

        const isMatchPassword = await user.isMatchPasswordSync(currentPassword)

        if (!isMatchPassword) {
            const errors = [new ApiError(ErrorCode.INVALID_PARAM, "Password does not match", LocationType.BODY, "/currentPassword")]
            throw new CommonError(ResponseCode.VALIDATION_FAILED, undefined, ErrorMessage.VALIDATION_FAILED, errors)
        }

        user.password = newPassword

        await this.dao.updateRecord(user)
    }

    async updateProfileOfNormalUser(email, userData) {
        const user = await this.dao.getUserByEmail(email)

        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This email does not exists!")
        }

        const { firstName, lastName, company, location, age, aboutMe } = userData

        if (firstName) {
            user.firstName = firstName
        }

        if (lastName) {
            user.lastName = lastName
        }

        if (company) {
            user.company = company
        }

        if (location) {
            user.location = location
        }

        if (age) {
            user.age = age
        }

        if (aboutMe) {
            user.aboutMe = aboutMe
        }

        await this.dao.updateRecord(user)
    }

    async forgotPasswordOfNormalUser(email) {
        const user = await this.dao.getUserByEmail(email)
        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "User not found!")
        }

        const changePasswordCode = DataUtils.randomKey(3)
        const currentMsTime = DateTimeUtils.getCurrentMsTime()

        user.changePasswordCode = {
            code: changePasswordCode,
            createdAt: currentMsTime
        }

        await this.dao.updateRecord(user)

        setTimeout(this.sendForgotPasswordEmail, 1000, user, changePasswordCode)

        return user
    }

    async updatePasswordByCodeOfNormalUser(email, changePasswordCode, password) {
        const user = await this.dao.getUserByEmail(email)

        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "User not found!")
        }

        if (user.changePasswordCode.code !== changePasswordCode) {
            const errors = [new ApiError(ErrorCode.INVALID_PARAM, "Code not match", LocationType.BODY, "/code")]
            throw new CommonError(ResponseCode.VALIDATION_FAILED, undefined, ErrorMessage.VALIDATION_FAILED, errors)
        }

        const codeCreatedAt = user.changePasswordCode.createdAt
        const currentMsTime = DateTimeUtils.getCurrentMsTime()

        const codeLifeTimes = config.code_lifetimes

        if (codeCreatedAt + codeLifeTimes < currentMsTime) {
            const errors = [new ApiError(ErrorCode.INVALID_PARAM, "Code has expired", LocationType.BODY, "/code")]
            throw new CommonError(ResponseCode.VALIDATION_FAILED, undefined, ErrorMessage.VALIDATION_FAILED, errors)
        }

        user.password = password
        user.changePasswordCode = {
            code: null,
            createdAt: 0
        }

        await this.dao.updateRecord(user)

        return user
    }

    async activeNormalUser(email, activeCode) {
        const user = await this.dao.getUserByEmail(email)

        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "User not found!")
        }

        if (user.activeCode.code !== activeCode) {
            const errors = [new ApiError(ErrorCode.INVALID_PARAM, "Code not match", LocationType.BODY, "/code")]
            throw new CommonError(ResponseCode.VALIDATION_FAILED, ResponseBodyCode.ACTIVE_USER.CODE_NOT_MATCH, ErrorMessage.VALIDATION_FAILED, errors)
        }

        const codeCreatedAt = user.activeCode.createdAt
        const currentMsTime = DateTimeUtils.getCurrentMsTime()
        const codeLifeTimes = config.code_lifetimes

        if (codeCreatedAt + codeLifeTimes < currentMsTime) {
            const errors = [new ApiError(ErrorCode.INVALID_PARAM, "Code has expired", LocationType.BODY, "/code")]
            throw new CommonError(ResponseCode.VALIDATION_FAILED, ResponseBodyCode.ACTIVE_USER.CODE_EXPIRED, ErrorMessage.VALIDATION_FAILED, errors)
        }

        user.isActive = true
        user.activeCode = {
            code: null,
            createdAt: 0
        }

        await this.dao.updateRecord(user)

        return user
    }

    async sendActiveUserCode(email) {
        const user = await this.dao.getUserByEmail(email)

        if (!user) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "User not found")
        }

        if (user.isActive) {
            throw new CommonError(ResponseCode.CONFLICT, undefined, "User has actived")
        }

        const activeCode = DataUtils.randomKey(3)
        const currentMsTime = DateTimeUtils.getCurrentMsTime()

        user.activeCode = {
            code: activeCode,
            createdAt: currentMsTime
        }

        await this.dao.updateRecord(user)

        setTimeout(this.sendNewUserEmail, 1000, user, activeCode)

        return user
    }

    async getUserProfileById(id) {
        const user = await this.getRawRecordById(id)

        return user
    }

    async getUserByEmail(email) {
        const user = await this.dao.getUserByEmail(email)
        return user
    }

    sendNewUserEmail(user, activeCode) {
        const { email, firstName, lastName } = user
        const subject = `Active user`
        const content = `Hi ${firstName}, your active code is ${activeCode}`
        const emailToSend = {
            subject: subject,
            content: content
        }

        EmailUtils.sendOneMail(email, emailToSend)
    }

    sendForgotPasswordEmail(user, changePasswordCode) {
        const { email, firstName, lastName } = user
        const subject = `Update password`
        const content = `Hi ${firstName}, use ${changePasswordCode} to update your password`
        const emailToSend = {
            subject: subject,
            content: content
        }

        EmailUtils.sendOneMail(email, emailToSend)
    }
}

export default UserService