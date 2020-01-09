import TopicSchema from "../schemas/topic_schema"
import BaseDAO from "./base_dao"
import { Collection } from "../commons/consts/database_consts"

class TopicDAO extends BaseDAO {
    constructor() {
        super(TopicSchema)
    }

    async getRecordByName(name) {
        const conditions = {
            name: name
        }

        const topic = await this.schema.findOne(conditions)

        return topic
    }

    async getRecordById(id) {
        const conditions = {
            _id: id
        }

        const query = this._getDetailQueryForGetTopic(conditions)
        const topics = await this.schema.aggregate(query)

        return topics[0]
    }

    _getDetailQueryForGetTopic(conditions) {
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
            $project: {
                name: "$name",
                desc: "$desc",
                questionCount: "$questionCount",
                memberCount: {
                    $size: "$members"
                },
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
                createdAt: "$createdAt"
            }
        }]

        return query
    }

    async getRecords(page, sortRules, conditions) {
        const query = this._getDetailQueryForGetTopics(page, sortRules, conditions)
        const topics = await this.schema.aggregate(query)
        return topics
    }

    _getDetailQueryForGetTopics(page, sortRules, conditions) {
        const query = this._getDetailQueryForGetTopic(conditions)
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

    async countTopics(conditions) {
        const result = await this.schema.find(conditions).count()
        return result
    }

    async getMembersOfTopic(topicId, keyword, page, sortRules) {
        const query = this._getQueryForGetMembersOfTopic(topicId, keyword, page, sortRules)
        const members = await this.schema.aggregate(query)

        return members
    }

    async countMemberOfTopic(topicId, keyword) {
        const query = this._getQueryForGetMembersOfTopic(topicId, keyword)
        const members = await this.schema.aggregate(query)

        return members.length
    }

    _getQueryForGetMembersOfTopic(topicId, keyword, page, sortRules) {
        const result = [{
            $match: {
                _id: topicId
            }
        }, {
            $lookup: {
                from: Collection.USER,
                localField: "members",
                foreignField: "_id",
                as: "topicMembers"
            }
        }, {
            $unwind: {
                path: "$topicMembers",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                _id: "$topicMembers._id",
                email: "$topicMembers.email",
                firstName: "$topicMembers.firstName",
                lastName: "$topicMembers.lastName"
            }
        }]

        if (keyword) {
            const keywordFilter = this._getKeywordFilterForGetMembersOfTopic(keyword)
            result.push({
                $match: keywordFilter
            })
        }

        if (page) {
            result.push({
                $sort: sortRules
            })
        }

        if (sortRules) {
            Array.prototype.push.apply(result, [
                {
                    $skip: page.skip
                }, {
                    $limit: page.limit
                }
            ])
        }

        return result
    }

    _getKeywordFilterForGetMembersOfTopic(keyword) {
        return {
            $or: [{
                email: new RegExp(keyword, "i")
            }, {
                firstName: new RegExp(keyword, "i")
            }, {
                lastName: new RegExp(keyword, "i")
            }]
        }
    }
}

export default TopicDAO