import QuestionDAO from "../daos/question_dao";
import QuestionTagService from "./question_tag_service";
import CommonError from "../commons/errors/common_error";
import { ResponseCode } from "../commons/consts/response_consts";
import VoteableService from "./voteable_service";
import DataUtils from "../utils/data_utils";
import TopicService from "./topic_service";
import QuestionVoteDAO from "../daos/question_vote_dao";
import UserService from "./user_service";

const questionDAO = new QuestionDAO();

class QuestionService extends VoteableService {
    constructor() {
        super(questionDAO);
        this.topicService = new TopicService();
        this.userService = new UserService();
        this.questionTagService = new QuestionTagService();
        this.questionVoteDAO = new QuestionVoteDAO();
    }

    async createFreeTopicQuestion(creator, questionData) {
        const { title, content, tags } = questionData;
        const existsTagIds = await this.getExistsQuestionTags(tags);
        const questionToInsert = {
            title: title,
            content: content,
            tags: existsTagIds,
            creator: creator
        };
        const question = await this.dao.insertRecord(questionToInsert);

        return question;
    }

    async createTopicQuestion(creator, questionData, topic) {
        const { title, content, tags } = questionData;
        const topicId = topic._id;
        const existsTagIds = await this.getExistsQuestionTags(tags);
        const questionToInsert = {
            title: title,
            content: content,
            topic: topicId,
            tags: existsTagIds,
            creator: creator
        };
        const questionPromise = this.dao.insertRecord(questionToInsert);
        const updateTopicPromise = this.topicService.countUpQuestion(topic);

        const question = await questionPromise;
        await updateTopicPromise;

        return question;
    }

    async updateRecord(record, questionData) {
        const { title, content, tags } = questionData;
        const existsTagIds = await this.getExistsQuestionTags(tags);

        if (title) {
            record.title = title;
        }

        if (content) {
            record.content = content;
        }

        if (existsTagIds.length) {
            record.tags = existsTagIds;
        }

        await this.dao.updateRecord(record);
    }

    async getExistsQuestionTags(tags) {
        if (!tags || !tags.length) {
            return [];
        }

        const existsTags = await this.questionTagService.getRawRecordsByIds(tags);
        const existsTagIds = existsTags.map(tag => tag._id);

        return existsTagIds;
    }

    async getQuestionsDetail(page, sortRules, keyword, topicId, userId) {
        const conditions = this._getConditionForGetQuestionsDetail(keyword, topicId, userId);
        const questions = await this.dao.getQuestionsDetail(page, sortRules, conditions);
        return questions;
    }

    async countQuestions(keyword, topicId, userId) {
        const conditions = this._getConditionForGetQuestionsDetail(keyword, topicId, userId);
        const result = await this.dao.countRecords(conditions);

        return result;
    }

    _getConditionForGetQuestionsDetail(keyword, topicId, userId) {
        const result = {};
        if (keyword) {
            result.$or = [
                {
                    title: new RegExp(keyword, "i")
                },
                {
                    content: new RegExp(keyword, "i")
                }
            ];
        }

        if (topicId) {
            result.topic = topicId;
        }

        if (userId) {
            result.creator = userId;
        }

        return result;
    }

    async deleteRecord(record) {
        const { _id, topic, voteCount, creator } = record;
        const promises = [this.dao.deleteRecordById(_id)];
        promises.push(this.questionVoteDAO.deleteVoteByQuestion(_id));
        promises.push(this.userService.countDownVotesById(creator, voteCount));

        if (topic) {
            promises.push(this.topicService.countDownQuestion(topic));
        }

        await Promise.all(promises);
    }

    async voteQuestion(id, userId) {
        if (!DataUtils.isMongoObjectId(id)) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question does not exists!");
        }

        const idObject = DataUtils.string2MongoObjectId(id);
        const userIdObject = DataUtils.string2MongoObjectId(userId);

        const questionPromise = this.dao.getRawRecordById(idObject);
        const votePromise = this.questionVoteDAO.getVote(userIdObject, idObject);

        const question = await questionPromise;
        const vote = await votePromise;

        if (!question) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question does not exists!");
        }

        if (vote) {
            throw new CommonError(ResponseCode.CONFLICT, undefined, "Voted");
        }

        const dataToInsert = {
            user: userId,
            question: id
        };

        const { creator } = question;

        const insertVotePromise = this.questionVoteDAO.insertRecord(dataToInsert);
        const updateQuestionPromise = this.countUpVoteOfRecord(question);
        const updateUserPromise = this.userService.countUpVote(creator);

        const promises = [insertVotePromise, updateQuestionPromise, updateUserPromise];

        await Promise.all(promises);
    }

    async unVoteQuestion(id, userId) {
        if (!DataUtils.isMongoObjectId(id)) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question does not exists!");
        }

        const idObject = DataUtils.string2MongoObjectId(id);
        const userIdObject = DataUtils.string2MongoObjectId(userId);

        const questionPromise = this.dao.getRawRecordById(idObject);
        const votePromise = this.questionVoteDAO.getVote(userIdObject, idObject);

        const question = await questionPromise;
        const vote = await votePromise;

        if (!question) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This question does not exists!");
        }

        if (!vote) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "You have not voted");
        }

        const { creator } = question;

        const deleteVotePromise = this.questionVoteDAO.deleteRecordById(vote._id);
        const updateQuestionPromise = this.dao.countDownVoteOfRecord(question);
        const updateUserPromise = this.userService.countDownVote(creator);

        const promises = [deleteVotePromise, updateQuestionPromise, updateUserPromise];

        await Promise.all(promises);
    }

    async countUpAnswerOfQuestion(question) {
        question.answerCount = question.answerCount + 1;

        await this.dao.updateRecord(question);
    }

    async countDownAnswerOfQuestion(question) {
        question.answerCount = question.answerCount - 1;

        await this.dao.updateRecord(question);
    }

    async countUpAnswerById(questionId) {
        const question = this.dao.getRecordById(questionId);

        if (!question) {
            return;
        }

        await this.countUpAnswerOfQuestion(question);
    }

    async countDownAnswerById(questionId) {
        const question = this.dao.getRecordById(questionId);

        if (!question) {
            return;
        }

        await this.dao.countDownAnswerOfQuestion(question);
    }
}

export default QuestionService;
