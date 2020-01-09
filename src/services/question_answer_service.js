import QuestionAnswerVoteDAO from "../daos/question_answer_vote_dao";
import QuestionAnswerDAO from "../daos/question_answer_dao";
import CommonError from "../commons/errors/common_error";
import { ResponseCode, LocationType, ErrorMessage } from "../commons/consts/response_consts";
import VoteableService from "./voteable_service";
import DataUtils from "../utils/data_utils";
import QuestionService from "./question_service";
import UserService from "./user_service";
import ApiError from "../commons/response_models/api_error";

class QuestionAnswerService extends VoteableService {
    constructor() {
        super(new QuestionAnswerDAO());
        this.questionService = new QuestionService();
        this.userService = new UserService();
        this.questionAnswerVoteDAO = new QuestionAnswerVoteDAO();
    }

    async createRecord(creator, data) {
        const { content, question } = data;
        const rawQuestion = await this.questionService.getRawRecordById(question);
        if (!rawQuestion) {
            const errors = [
                new ApiError(ResponseCode.VALIDATION_FAILED, "Question does not exists", LocationType.BODY, "/question")
            ];
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, ErrorMessage.VALIDATION_FAILED, errors);
        }

        const questionAnswerToInsert = {
            question: question,
            content: content,
            creator: creator
        };

        const updateQuestionPromise = this.questionService.countUpAnswerOfQuestion(rawQuestion);
        const questionAnswerPromise = this.dao.insertRecord(questionAnswerToInsert);

        await updateQuestionPromise;
        const questionAnswer = await questionAnswerPromise;

        return questionAnswer;
    }

    async updateRecord(record, questionAnswerData) {
        const { content } = questionAnswerData;

        if (!content) {
            return;
        }

        record.content = content;

        await this.dao.updateRecord(record);
    }

    async getQuestionAnswersDetail(page, questionId) {
        const conditions = this._getConditionForGetQuestionAnswersDetail(questionId);
        const questionAnswers = await this.dao.getQuestionAnswersDetail(page, conditions);
        return questionAnswers;
    }

    async countQuestionAnswers(questionId) {
        const conditions = this._getConditionForGetQuestionAnswersDetail(questionId);
        const result = await this.dao.countRecords(conditions);

        return result;
    }

    _getConditionForGetQuestionAnswersDetail(questionId) {
        const result = {};

        if (questionId) {
            result.question = questionId;
        }

        return result;
    }

    async deleteRecord(record) {
        const { _id, question, creator, voteCount } = record;
        const promises = [this.dao.deleteRecordById(_id)];

        promises.push(this.questionService.countDownAnswerById(question));
        promise.push(this.userService.countDownVotesById(creator, voteCount));

        await Promise.all(promises);
    }

    async voteQuestionAnswer(id, userId) {
        if (!DataUtils.isMongoObjectId(id)) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question answer does not exists!");
        }

        const idObject = DataUtils.string2MongoObjectId(id);
        const userIdObject = DataUtils.string2MongoObjectId(userId);

        const questionAnswerPromise = this.dao.getRawRecordById(idObject);
        const votePromise = this.questionAnswerVoteDAO.getVote(userIdObject, idObject);

        const questionAnswer = await questionAnswerPromise;
        const vote = await votePromise;

        if (!questionAnswer) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question answer does not exists!");
        }

        if (vote) {
            throw new CommonError(ResponseCode.CONFLICT, undefined, "Voted");
        }

        const dataToInsert = {
            user: userId,
            answer: id
        };

        const { creator } = questionAnswer;

        const insertVotePromise = this.questionAnswerVoteDAO.insertRecord(dataToInsert);
        const updateQuestionAnswerPromise = this.countUpVoteOfRecord(questionAnswer);
        const updateUserPromise = this.userService.countUpVote(creator);

        promises = [insertVotePromise, updateQuestionAnswerPromise, updateUserPromise];

        await Promise.all(promises);
    }

    async unVoteQuestionAnswer(id, userId) {
        if (!DataUtils.isMongoObjectId(id)) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question answer does not exists!");
        }

        const idObject = DataUtils.string2MongoObjectId(id);
        const userIdObject = DataUtils.string2MongoObjectId(userId);

        const questionAnswerPromise = this.dao.getRawRecordById(idObject);
        const votePromise = this.questionAnswerVoteDAO.getVote(userIdObject, idObject);

        const questionAnswer = await questionAnswerPromise;
        const vote = await votePromise;

        if (!questionAnswer) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question answer does not exists!");
        }

        if (!vote) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "You have not voted");
        }

        const { creator } = questionAnswer;

        const deleteVotePromise = this.questionAnswerVoteDAO.deleteRecordById(vote._id);
        const updateQuestionAnswerPromise = this.dao.countDownVoteOfRecord(questionAnswer);
        const updateUserPromise = this.userService.countDownVote(creator);

        const promises = [deleteVotePromise, updateQuestionAnswerPromise, updateUserPromise];

        await Promise.all(promises);
    }
}

export default QuestionAnswerService;
