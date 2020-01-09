import DataUtils from "../utils/data_utils";
import ApiError from "../commons/response_models/api_error";
import { ErrorCode, ErrorMessage, LocationType, ResponseCode } from "../commons/consts/response_consts";
import ErrorResponse from "../commons/response_models/error_response";
import SuccessResponse from "../commons/response_models/success_response";
import QuestionService from "../services/question_service";
import omit from "object.omit";
import RequestUtils from "../utils/request_utils";
import PagedData from "../commons/response_models/paged_data";
import BaseController from "./base_controller";

class QuestionController extends BaseController {
    constructor() {
        super(new QuestionService());
        this.getRecords = this.getRecords.bind(this);
        this.createFreeTopicQuestion = this.createFreeTopicQuestion.bind(this);
        this.createTopicQuestion = this.createTopicQuestion.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);
        this.updateRecord = this.updateRecord.bind(this);
        this.voteQuestion = this.voteQuestion.bind(this);
        this.unVoteQuestion = this.unVoteQuestion.bind(this);
        this.getMyQuestions = this.getMyQuestions.bind(this);
        this._validateRequestBodyForCreateQuestion = this._validateRequestBodyForCreateQuestion.bind(this);
        this._validateRequestBodyForUpdateQuestion = this._validateRequestBodyForUpdateQuestion.bind(this);
    }

    async getRecords(req, res, next) {
        const requestQuery = req.query;
        const { sort, limit, offset, topic, keyword } = requestQuery;

        const sortRules = RequestUtils.parseSort(sort);
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

        const topicIdObject = DataUtils.string2MongoObjectId(topic);

        const questionsPromise = this.service.getQuestionsDetail(page, sortRules, keyword, topicIdObject);
        const totalQuestionPromise = this.service.countQuestions(keyword, topicIdObject);

        const questions = await questionsPromise;
        const totalQuestion = await totalQuestionPromise;

        const data = new PagedData(questions, totalQuestion, page.skip);
        const responseBody = new SuccessResponse(undefined, undefined, data);
        return res.status(ResponseCode.OK).json(responseBody);
    }

    async createFreeTopicQuestion(req, res, next) {
        const requestBody = req.body;
        const userId = RequestUtils.getUserIdFromRequest(req);

        try {
            this._validateRequestBodyForCreateQuestion(requestBody);
        } catch (errors) {
            const responseBody = new ErrorResponse(ErrorMessage.VALIDATION_FAILED, errors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        const question = await this.service.createFreeTopicQuestion(userId, requestBody);
        const questionDetails = await this.service.getRecordById(question._id);

        const response = omit(questionDetails, ["createdAt", "updatedAt"]);
        return res.status(ResponseCode.CREATED).json(response);
    }

    async createTopicQuestion(req, res, next) {
        const requestBody = req.body;
        const topic = req.record;
        const userId = RequestUtils.getUserIdFromRequest(req);

        try {
            this._validateRequestBodyForCreateQuestion(requestBody);
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        const question = await this.service.createTopicQuestion(userId, requestBody, topic);
        const questionDetails = await this.service.getRecordById(question._id);

        const response = omit(questionDetails, ["updatedAt"]);
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
            this._validateRequestBodyForUpdateQuestion(requestBody);
        } catch (errors) {
            const responseBody = new ErrorResponse(undefined, ErrorMessage.VALIDATION_FAILED, errors);
            return res.status(ResponseCode.VALIDATION_FAILED).json(responseBody);
        }

        await this.service.updateRecord(record, requestBody);

        return res.status(ResponseCode.NO_CONTENT).send();
    }

    async voteQuestion(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req);
        const requestParams = req.params;
        const { recordId } = requestParams;

        await this.service.voteQuestion(recordId, userId);

        return res.status(ResponseCode.NO_CONTENT).send();
    }

    async unVoteQuestion(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req);
        const requestParams = req.params;
        const { recordId } = requestParams;

        await this.service.unVoteQuestion(recordId, userId);

        return res.status(ResponseCode.NO_CONTENT).send();
    }

    _validateRequestBodyForCreateQuestion(requestBody) {
        const errors = [];
        const { title, content, tags } = requestBody;

        if (!DataUtils.isHasValue(title) || !DataUtils.isValidCommonText(title)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid title", LocationType.BODY, "/title"));
        }

        if (!DataUtils.isHasValue(content) || !DataUtils.isValidCommonText(content)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid content", LocationType.BODY, "/content"));
        }

        if (!(tags instanceof Array)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid tags", LocationType.BODY, "/tags"));
        }

        if (errors.length) {
            throw errors;
        }
    }

    _validateRequestBodyForUpdateQuestion(requestBody) {
        const errors = [];
        const { title, content, tags } = requestBody;

        if (DataUtils.isHasValue(title) && !DataUtils.isValidCommonText(title)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid title", LocationType.BODY, "/title"));
        }

        if (DataUtils.isHasValue(content) && !DataUtils.isValidCommonText(content)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid content", LocationType.BODY, "/content"));
        }

        if (DataUtils.isHasValue(tags) && !(tags instanceof Array)) {
            errors.push(new ApiError(ErrorCode.INVALID_PARAM, "Invalid tags", LocationType.BODY, "/tags"));
        }

        if (errors.length) {
            throw errors;
        }
    }

    async getMyQuestions(req, res, next) {
        const userId = RequestUtils.getUserIdFromRequest(req);

        const requestQuery = req.query;
        const { sort, limit, offset, topic, keyword } = requestQuery;

        const sortRules = RequestUtils.parseSort(sort);
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

        const topicIdObject = DataUtils.string2MongoObjectId(topic);
        const userIdObject = DataUtils.string2MongoObjectId(userId);

        const questionsPromise = this.service.getQuestionsDetail(page, sortRules, keyword, topicIdObject, userIdObject);
        const totalQuestionPromise = this.service.countQuestions(keyword, topicIdObject, userIdObject);

        const questions = await questionsPromise;
        const totalQuestion = await totalQuestionPromise;

        const data = new PagedData(questions, totalQuestion, page.skip);
        const responseBody = new SuccessResponse(undefined, undefined, data);
        return res.status(ResponseCode.OK).json(responseBody);
    }
}

export default QuestionController;
