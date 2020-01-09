import BaseDAO from "./base_dao"
import QuestionSchema from "../schemas/question_schema"
import { Collection } from "../commons/consts/database_consts"

class QuestionDAO extends BaseDAO {
    constructor() {
        super(QuestionSchema)
    }

    async getRecordById(id) {
        const conditions = {
            _id: id
        }

        const query = this._getDetailQueryForGetQuestion(conditions)
        const questions = await this.schema.aggregate(query)

        return questions[0]
    }

    _getDetailQueryForGetQuestion(conditions) {
        const query = [{
            $match: conditions
        }, {
            $lookup: {
                from: Collection.USER,
                localField: "creator",
                foreignField: "_id",
                as: "creators"
            }
        }, {
            $lookup: {
                from: Collection.TOPIC,
                localField: "topic",
                foreignField: "_id",
                as: "topics"
            }
        }, {
            $lookup: {
                from: Collection.QUESTION_TAG,
                localField: "tags",
                foreignField: "_id",
                as: "question_tags"
            }
        }, {
            $project: {
                _id: "$_id",
                title: "$title",
                content: "$content",
                voteCount: "$voteCount",
                answerCount: "$answerCount",
                creator: {
                    $cond: [{
                            $size: "$creators"
                        }, {
                            _id: {
                                $arrayElemAt: ["$creators._id", -1]
                            },
                            firstName: {
                                $arrayElemAt: ["$creators.firstName", -1]
                            },
                            lastName: {
                                $arrayElemAt: ["$creators.lastName", -1]
                            },
                        },
                        "$noval"
                    ]
                },
                topic: {
                    $cond: [{
                            $size: "$topics"
                        }, {
                            _id: {
                                $arrayElemAt: ["$topics._id", -1]
                            },
                            name: {
                                $arrayElemAt: ["$topics.name", -1]
                            }
                        },
                        "$noval"
                    ]
                },
                tags: "$question_tags",
                createdAt: "$createdAt"
            }
        }]

        return query
    }

    async getQuestionsDetail(page, sortRules, conditions) {
        const query = this._getDetailQueryForGetQuestions(page, sortRules, conditions)
        const questions = await QuestionSchema.aggregate(query)
        return questions
    }

    _getDetailQueryForGetQuestions(page, sortRules, conditions) {
        const query = this._getDetailQueryForGetQuestion(conditions)
        query.push({
            $sort: sortRules
        })
        Array.prototype.push.apply(query, [
            {
                $skip: page.skip
            }, {
                $limit: page.limit
            }
        ])

        return query
    }
}

export default QuestionDAO