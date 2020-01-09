import DataUtils from "../utils/data_utils"
import ApiError from "../commons/response_models/api_error"
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts"
import ErrorResponse from "../commons/response_models/error_response"
import SuccessResponse from "../commons/response_models/success_response"
import TopicService from "../services/topic_service"
import omit from "object.omit"
import RequestUtils from "../utils/request_utils"
import PagedData from "../commons/response_models/paged_data"
import BaseController from "./base_controller"

class TopicController extends BaseController {
    constructor() {
        super(new TopicService())
        this.createRecord = this.createRecord.bind(this)
        this.updateRecord = this.updateRecord.bind(this)
        this.addMembersToTopic = this.addMembersToTopic.bind(this)
        this.removeMembersFromTopic = this.removeMembersFromTopic.bind(this)
        this.getJoinTopics = this.getJoinTopics.bind(this)
        this.getMyTopics = this.getMyTopics.bind(this)
        this.getMembersOfTopic = this.getMembersOfTopic.bind(this)
        this._validateRequestBodyForCreateTopic = this._validateRequestBodyForCreateTopic.bind(this)
        this._validateRequestBodyForUpdateTopic = this._validateRequestBodyForUpdateTopic.bind(this)
        this._validateRequestBodyToRemoveMemberFromTopic = this._validateRequestBodyToRemoveMemberFromTopic.bind(this)
        this._validateRequestBodyToAddMemberToTopic = this._validateRequestBodyToAddMemberToTopic.bind(this)
    }

    async createRecord(req, res, next) {
        const requestBody = req.body
        const userId = RequestUtils.getUserIdFromRequest(req)
    
        try {
            this._validateRequestBodyForCreateTopic(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        const topic = await this.service.createRecord(userId, requestBody)
        const topicDetails = await this.service.getRecordById(topic._id)

        const response = omit(topicDetails, ["_id", "updatedAt"])
    
        return res.status(ResponseCode.CREATED).json(response)
    }

    async updateRecord(req, res, next) {
        const requestBody = req.body
        const topic = req.record

        try {
            this._validateRequestBodyForUpdateTopic(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }

        await this.service.updateRecord(topic, requestBody)

        return res.status(ResponseCode.NO_CONTENT).send()
    }

    async addMembersToTopic(req, res, next) {
        const requestParams = req.params
        const requestBody = req.body

        try {
            this._validateRequestBodyToAddMemberToTopic(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }

        const { recordId } = requestParams
        const { email } = requestBody

        await this.service.addMemberToTopic(recordId, email)

        return res.status(ResponseCode.NO_CONTENT).send()
    }

    async removeMembersFromTopic(req, res, next) {
        const requestParams = req.params
        const requestBody = req.body

        try {
            this._validateRequestBodyToRemoveMemberFromTopic(requestBody)
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }

        const { topicId } = requestParams
        const { users } = requestBody

        await this.service.removeMemberFromTopic(topicId, users)

        return res.status(ResponseCode.NO_CONTENT).send()
    }

    async getMembersOfTopic(req, res, next) {
        const requestQuery = req.query
        const { sort, limit, offset, keyword } = requestQuery
        const topic = req.record

        const sortRules = RequestUtils.parseSort(sort)
        let page = {}

        try {
            page = RequestUtils.getPage(limit, offset)
        } catch (errors) {
            const apiErrors = errors.map(error => new ApiError(ErrorCode.INVALID_PARAM, error.message, LocationType.QUERY, error.location))
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, apiErrors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }

        const topicMembersPromise = this.service.getMembersOfTopic(topic, keyword, page, sortRules)
        const totalTopicMemberPromise = this.service.countMemberOfTopic(topic, keyword)

        const topicMembers = await topicMembersPromise
        const totalTopicMember = await totalTopicMemberPromise

        const data = new PagedData(topicMembers, totalTopicMember, page.skip)
        const responseBody = new SuccessResponse(undefined, undefined, data)
        return res.status(ResponseCode.OK).json(responseBody)
    }

    async getJoinTopics(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req)
        const requestQuery = req.query
        const { sort, limit, offset, keyword } = requestQuery

        const sortRules = RequestUtils.parseSort(sort)
        let page = {}

        try {
            page = RequestUtils.getPage(limit, offset)
        } catch (errors) {
            const apiErrors = errors.map(error => new ApiError(ErrorCode.INVALID_PARAM, error.message, LocationType.QUERY, error.location))
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, apiErrors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }

        const userIdObject = DataUtils.string2MongoObjectId(userId)

        const topicsPromise = this.service.getJoinTopicsDetail(page, sortRules, keyword, userIdObject)
        const totalTopicPromise = this.service.countJoinTopics(keyword, userIdObject)

        const topics = await topicsPromise
        const totalTopic = await totalTopicPromise

        const data = new PagedData(topics, totalTopic, page.skip)
        const responseBody = new SuccessResponse(undefined, undefined, data)
        return res.status(ResponseCode.OK).json(responseBody)
    }

    async getMyTopics(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req)
        const requestQuery = req.query
        const { sort, limit, offset, keyword } = requestQuery
    
        const sortRules = RequestUtils.parseSort(sort)
        let page = {}
    
        try {
            page = RequestUtils.getPage(limit, offset)
        } catch (errors) {
            const apiErrors = errors.map(error => new ApiError(ErrorCode.INVALID_PARAM, error.message, LocationType.QUERY, error.location))
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, apiErrors)
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody)
        }
    
        const userIdObject = DataUtils.string2MongoObjectId(userId)
    
        const topicsPromise = this.service.getMyTopics(page, sortRules, keyword, userIdObject)
        const totalTopicPromise = this.service.countMyTopics(keyword, userIdObject)
    
        const topics = await topicsPromise
        const totalTopic = await totalTopicPromise
    
        const data = new PagedData(topics, totalTopic, page.skip)
        const responseBody = new SuccessResponse(undefined, undefined, data)
        return res.status(ResponseCode.OK).json(responseBody)
    }

    _validateRequestBodyForCreateTopic(requestBody) {
        const errors = []
        const { name, desc } = requestBody
    
        if (!DataUtils.isHasValue(desc) || !DataUtils.isValidCommonText(desc)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid desc", LocationType.BODY, "/desc"))
        }
    
        if (!DataUtils.isHasValue(name) || !DataUtils.isValidName(name)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid name", LocationType.BODY, "/name"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    _validateRequestBodyForUpdateTopic(requestBody) {
        const errors = []
        const { name, desc } = requestBody
    
        if (DataUtils.isHasValue(name) && !DataUtils.isValidName(name)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid name`, LocationType.BODY, "/name"))
        }
    
        if (DataUtils.isHasValue(desc) && !DataUtils.isValidCommonText(desc)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid desc`, LocationType.BODY, "/desc"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
    
    _validateRequestBodyToRemoveMemberFromTopic(requestBody) {
        const errors = []
        const { users } = requestBody

        if (!(users instanceof Array)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `users must be array`, LocationType.BODY, "/users"))
        }
    
        if (errors.length) {
            throw errors
        }
    }

    _validateRequestBodyToAddMemberToTopic(requestBody) {
        const errors = []
        const { email } = requestBody
    
        if (!DataUtils.isHasValue(email) || !DataUtils.isValidEmailAddress(email)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, `Invalid email`, LocationType.BODY, "/email"))
        }
    
        if (errors.length) {
            throw errors
        }
    }
}

export default TopicController

