import DataUtils from "../utils/data_utils";
import ApiError from "../commons/response_models/api_error";
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts";
import ErrorResponse from "../commons/response_models/error_response";
import SuccessResponse from "../commons/response_models/success_response";
import QuestionAnswerService from "../services/question_answer_service";
import omit from "object.omit";
import RequestUtils from "../utils/request_utils";
import PagedData from "../commons/response_models/paged_data";
import BaseController from "./base_controller";

class QuestionAnswerController extends BaseController {
    constructor() {
        super(new QuestionAnswerService());
        this.getRecords = this.getRecords.bind(this);
        this.createRecord = this.createRecord.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);
        this.updateRecord = this.updateRecord.bind(this);
        this.voteQuestionAnswer = this.voteQuestionAnswer.bind(this);
        this.unVoteQuestionAnswer = this.unVoteQuestionAnswer.bind(this);
        this._validateRequestBodyForCreateQuestionAnswer = this._validateRequestBodyForCreateQuestionAnswer.bind(this);
        this._validateRequestBodyForUpdateQuestionAnswer = this._validateRequestBodyForUpdateQuestionAnswer.bind(this);
    }

    async getRecords(req, res, next) {
        const requestQuery = req.query;
        const { limit, offset, question } = requestQuery;
        let page = {};

        try {
            page = RequestUtils.getPage(limit, offset);
        } catch (errors) {
            const apiErrors = errors.map(
                error => new ApiError(ErrorCode.INVALID_PARAM, error.message, LocationType.QUERY, error.location)
            );
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, apiErrors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        const questionIdObject = DataUtils.string2MongoObjectId(question);
        const questionAnswersPromise = this.service.getQuestionAnswersDetail(page, questionIdObject);
        const totalQuestionAnswerPromise = this.service.countQuestionAnswers(questionIdObject);

        const questionAnswers = await questionAnswersPromise;
        const totalQuestionAnswer = await totalQuestionAnswerPromise;

        const data = new PagedData(questionAnswers, totalQuestionAnswer, page.skip);
        const responseBody = new SuccessResponse(undefined, undefined, data);
        return res.status(ResponseCode.OK).json(responseBody);
    }

    async createRecord(req, res, next) {
        const requestBody = req.body;
        const userId = RequestUtils.getUserIdFromRequest(req);

        try {
            this._validateRequestBodyForCreateQuestionAnswer(requestBody);
        } catch (errors) {
            const responseBody = new ErrorResponse(ErrorMessage.VALIDATION_FAILED, errors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        const questionAnswer = await this.service.createRecord(userId, requestBody);
        const questionAnswerDetails = await this.service.getRecordById(questionAnswer._id);

        const response = omit(questionAnswerDetails, ["createdAt", "updatedAt"]);
        return res.status(ResponseCode.CREATED).json(response);
    }

    async deleteRecord(req, res, next) {
        const record = req.record;
        await this.service.deleteRecord(record);
        return res.status(ResponseCode.NO_CONTENT).send();
    }

    async updateRecord(req, res, next) {
        const requestBody = req.body;
        const record = req.record;

        try {
            this._validateRequestBodyForUpdateQuestionAnswer(requestBody);
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        await this.service.updateRecord(record, requestBody);
        return res.status(ResponseCode.NO_CONTENT).send();
    }

    async voteQuestionAnswer(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req);
        const requestParams = req.params;
        const { recordId } = requestParams;

        await this.service.voteQuestionAnswer(recordId, userId);
        return res.status(ResponseCode.NO_CONTENT).send();
    }

    async unVoteQuestionAnswer(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req);
        const requestParams = req.params;
        const { recordId } = requestParams;

        await this.service.unVoteQuestionAnswer(recordId, userId);
        return res.status(ResponseCode.NO_CONTENT).send();
    }

    _validateRequestBodyForCreateQuestionAnswer(requestBody) {
        const errors = [];
        const { content, question } = requestBody;

        if (!DataUtils.isHasValue(content) || !DataUtils.isValidCommonText(content)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid content", LocationType.BODY, "/content"));
        }

        if (!DataUtils.isHasValue(question) || !DataUtils.isMongoObjectId(question)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid question", LocationType.BODY, "/question"));
        }

        if (errors.length) {
            throw errors;
        }
    }

    _validateRequestBodyForUpdateQuestionAnswer(requestBody) {
        const errors = [];
        const { content } = requestBody;

        if (DataUtils.isHasValue(content) && !DataUtils.isValidCommonText(content)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid content", LocationType.BODY, "/content"));
        }

        if (errors.length) {
            throw errors;
        }
    }
}

export default QuestionAnswerController;
