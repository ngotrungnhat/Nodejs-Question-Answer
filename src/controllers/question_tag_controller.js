import ApiError from "../commons/response_models/api_error"
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts"
import ErrorResponse from "../commons/response_models/error_response"
import SuccessResponse from "../commons/response_models/success_response"
import QuestionTagService from "../services/question_tag_service"
import RequestUtils from "../utils/request_utils"
import PagedData from "../commons/response_models/paged_data"
import BaseController from "./base_controller"

class QuestionTagController extends BaseController {
    constructor() {
        super(new QuestionTagService())
        this.getRecords = this.getRecords.bind(this)
    }

    async getRecords(req, res, next) {
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
        
        const questionTagsPromise = this.service.getRecords(keyword, page, sortRules)
        const totalQuestionTagPromise = this.service.countRecord(keyword)
    
        const questionTags = await questionTagsPromise
        const totalQuestionTag = await totalQuestionTagPromise
    
        const data = new PagedData(questionTags, totalQuestionTag, page.skip)
        const responseBody = new SuccessResponse(undefined, undefined, data)
        return res.status(ResponseCode.OK).json(responseBody)
    }
}

export default QuestionTagController