import BaseDAO from "./base_dao";
import QuestionAnswerSchema from "../schemas/question_answer_schema";
import { Collection } from "../commons/consts/database_consts";

class QuestionAnswerDAO extends BaseDAO {
    constructor() {
        super(QuestionAnswerSchema);
    }

    async getRecordById(id) {
        const conditions = {
            _id: id
        };

        const query = this._getDetailQueryForGetQuestionAnswer(conditions);
        const questionAnswers = await this.schema.aggregate(query);
        return questionAnswers[0];
    }

    _getDetailQueryForGetQuestionAnswer(conditions) {
        const query = [
            {
                $match: conditions
            },
            {
                $lookup: {
                    from: Collection.USER,
                    localField: "creator",
                    foreignField: "_id",
                    as: "creators"
                }
            },
            {
                $lookup: {
                    from: Collection.QUESTION,
                    localField: "question",
                    foreignField: "_id",
                    as: "questions"
                }
            },
            {
                $project: {
                    _id: "$_id",
                    content: "$content",
                    voteCount: "$voteCount",
                    replyCount: "$replyCount",
                    creator: {
                        $cond: [
                            {
                                $size: "$creators"
                            },
                            {
                                _id: {
                                    $arrayElemAt: ["$creators._id", -1]
                                },
                                firstName: {
                                    $arrayElemAt: ["$creators.firstName", -1]
                                },
                                lastName: {
                                    $arrayElemAt: ["$creators.lastName", -1]
                                }
                            },
                            "$noval"
                        ]
                    },
                    question: {
                        $cond: [
                            {
                                $size: "$questions"
                            },
                            {
                                _id: {
                                    $arrayElemAt: ["$questions._id", -1]
                                },
                                title: {
                                    $arrayElemAt: ["$questions.title", -1]
                                }
                            },
                            "$noval"
                        ]
                    },
                    createdAt: "$createdAt"
                }
            }
        ];

        return query;
    }

    async getQuestionAnswersDetail(page, conditions) {
        const query = this._getDetailQueryForGetquestionAnswers(page, conditions);
        const questionAnswers = await this.schema.aggregate(query);
        return questionAnswers;
    }

    _getDetailQueryForGetquestionAnswers(page, conditions) {
        const query = this._getDetailQueryForGetQuestionAnswer(conditions);

        Array.prototype.push.apply(query, [
            {
                $skip: page.skip
            },
            {
                $limit: page.limit
            }
        ]);

        return query;
    }
}

export default QuestionAnswerDAO;
