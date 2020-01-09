import CommonError from "../commons/errors/common_error";
import { ErrorMessage, ResponseCode } from "../commons/consts/response_consts";
import TopicService from "../services/topic_service";
import QuestionService from "../services/question_service";
import QuestionAnswerService from "../services/question_answer_service";

const topicService = new TopicService();
const questionService = new QuestionService();
const questionAnswerService = new QuestionAnswerService();

// export const validateTopicOwnerPermission = async (req, res, next) => {
//     const userId = req.decodedToken.id
//     const requestParams = req.params

//     const { recordId } = requestParams

//     const topic = await topicService.getRawRecordById(recordId)

//     if (!topic) {
//         throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Topic not found")
//     }

//     req.record = topic

//     const { creator } = topic

//     if (creator.toString() !== userId) {
//         throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN)
//     }

//     return next()
// }

export const validateTopicMemberPermission = async (req, res, next) => {
    const userId = req.decodedToken.id;
    const requestParams = req.params;

    const { recordId } = requestParams;

    const topic = await topicService.getRawRecordById(recordId);

    if (!topic) {
        throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Topic not found");
    }

    req.record = topic;

    const { members, creator } = topic;

    if (!members.map(memberId => memberId.toString()).includes(userId) && creator.toString() !== userId) {
        throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN);
    }

    return next();
};

// export const validateQuestionOwnerPermission = async (req, res, next) => {
//     const userId = req.decodedToken.id
//     const requestParams = req.params

//     const { recordId } = requestParams

//     const question = await questionService.getRawRecordById(recordId)

//     if (!question) {
//         throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Question not found")
//     }

//     const { creator } = question

//     if (creator.toString() !== userId) {
//         throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN)
//     }

//     req.record = question

//     return next()
// }

export const validateRecordOwnerPermission = async (req, res, next) => {
    const userId = req.decodedToken.id;
    const requestParams = req.params;

    const { recordId, type } = requestParams;

    let service = null;

    switch (type) {
        case "topics":
            service = topicService;
            break;
        case "question-answers":
            service = questionAnswerService;
            break;
        case "questions":
            service = questionService;
            break;
        default:
            break;
    }

    if (!service) {
        return next();
    }

    const record = await service.getRawRecordById(recordId);

    if (!record) {
        throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Record not found");
    }

    const { creator } = record;

    if (creator.toString() !== userId) {
        throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN);
    }
    req.record = record;

    return next();
};

// export const validateQuestionAnswerOwnerPermission = async (req, res, next) => {
//     const userId = req.decodedToken.id
//     const requestParams = req.params

//     const { recordId } = requestParams

//     const questionAnswer = await questionAnswerService.getRawRecordById(recordId)

//     if (!questionAnswer) {
//         throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Question answer not found")
//     }

//     const { creator } = questionAnswer

//     if (creator.toString() !== userId) {
//         throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN)
//     }

//     req.record = questionAnswer

//     return next()
// }

export const validateDeleteQuestionPermission = async (req, res, next) => {
    const userId = req.decodedToken.id;
    const requestParams = req.params;

    const { recordId } = requestParams;

    const question = await questionService.getRawRecordById(recordId);

    if (!question) {
        throw new CommonError(ResponseCode.NOT_FOUND, undefined, "Question not found");
    }

    req.record = question;

    const { creator, topic } = question;

    if (creator.toString() === userId) {
        return next();
    }

    if (!topic) {
        throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN);
    }

    tp = await topicService.getRawRecordById(record);

    if (!tp || tp.creator.toString() !== userId) {
        throw new CommonError(ResponseCode.FORBIDDEN, undefined, ErrorMessage.FORBIDDEN);
    }

    return next();
};
