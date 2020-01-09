import TopicDAO from "../daos/topic_dao"
import CommonError from "../commons/errors/common_error"
import { ResponseCode } from "../commons/consts/response_consts"
import BaseService from "./base_service"
import UserService from "./user_service"
import EmailUtils from "../utils/email_utils"

class TopicService extends BaseService {
    constructor() {
        super(new TopicDAO())
        this.userService = new UserService()
    }

    async createRecord(creator, requestBody) {
        const { name } = requestBody
        let topic = await this.dao.getRecordByName(name)

        if (topic) {
            throw new CommonError(ResponseCode.CONFLICT, undefined, "This topic already exists!")
        }

        const insertedTopic = await this.dao.insertRecord(Object.assign(requestBody, {creator: creator}))

        return insertedTopic
    }

    async updateRecord(topic, topicData) {
        const { name, desc } = topicData

        if (name) {
            topic.name = name
        }

        if (desc) {
            topic.desc = desc
        }

        await this.dao.updateRecord(topic)
    }

    async addMemberToTopic(id, email) {
        const topicPromise = this.dao.getRawRecordById(id)
        const userPromise = this.userService.getUserByEmail(email)

        const topic = await topicPromise
        const user = await userPromise

        if (!topic) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This topic does not exists!")
        }

        if (!user) {
            const errors = [new ApiError(ResponseCode.VALIDATION_FAILED, "User does not exists", LocationType.BODY, "/email")]
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, ErrorMessage.VALIDATION_FAILED, errors)
        }

        const { members } = topic
        const { _id } = user

        if (members.includes(_id)) {
            return
        }

        members.push(_id)
        topic.members = members

        await this.dao.updateRecord(topic)

        setTimeout(this.sendNewMemberEmail, 1000, user, topic)
    }

    async removeMemberFromTopic(id, users) {
        const topic = await this.dao.getRawRecordById(id)

        if (!topic) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This topic does not exists!")
        }

        const { members } = topic

        const membersAfter = members.filter(member => !users.includes(member))

        topic.members = membersAfter

        await this.dao.updateRecord(topic)
    }

    async getJoinTopicsDetail(page, sortRules, keyword, userId) {
        const conditions = this._getConditionsForGetJoinTopics(keyword, userId)
        const topics = await this.dao.getTopicsDetail(page, sortRules, conditions)
        return topics
    }

    async countJoinTopics(keyword, userId) {
        const conditions = this._getConditionsForGetJoinTopics(keyword, userId)
        const result = await this.dao.countRecords(conditions)
        return result
    }

    async getMembersOfTopic(topic, keyword, page, sortRules) {
        const { members, _id } = topic

        if (!members.length) {
            return []
        }

        const result = await this.dao.getMembersOfTopic(_id, keyword, page, sortRules)

        return result
    }

    async countMemberOfTopic(topic, keyword) {
        const { members, _id } = topic

        if (!members.length) {
            return 0
        }

        const result = await this.dao.countMemberOfTopic(_id, keyword)

        return result
    }

    async countUpQuestion(topicId) {
        const topic = await this.getRawRecordById(topicId)

        if (!topic) {
            return
        }

        topic.questionCount = topic.questionCount + 1

        await this.dao.updateRecord(topic)
    }

    async countDownQuestion(topicId) {
        const topic = await this.getRawRecordById(topicId)

        if (!topic) {
            return
        }

        topic.questionCount = topic.questionCount - 1

        await this.dao.updateRecord(topic)
    }

    _getConditionsForGetJoinTopics(keyword, userId) {
        const userQuery = {
            members: {
                $elemMatch: userId
            }
        }

        if (!keyword) {
            return userQuery
        }

        const keywordQuery = {
            $or: [{
                name: new RegExp(keyword, "i")
            }, {
                desc: new RegExp(keyword, "i")
            }]
        }

        return {
            $and: [userQuery, keywordQuery]
        }
    }

    async getMyTopics(page, sortRules, keyword, userId) {
        const conditions = this._getConditionsForGetMyTopics(keyword, userId)
        const topics = await this.dao.getRecords(page, sortRules, conditions)
        return topics
    }

    async countMyTopics(keyword, userId) {
        const conditions = this._getConditionsForGetMyTopics(keyword, userId)
        const result = await this.dao.countRecords(conditions)
        return result
    }

    _getConditionsForGetMyTopics(keyword, userId) {
        const userQuery = {
            creator: userId
        }

        if (!keyword) {
            return userQuery
        }

        const keywordQuery = {
            $or: [{
                name: new RegExp(keyword, "i")
            }, {
                desc: new RegExp(keyword, "i")
            }]
        }

        return {
            $and: [userQuery, keywordQuery]
        }
    }

    sendNewMemberEmail(user, topic) {
        const { email, firstName, lastName } = user
        const subject = `You had added to topic`
        const content = `Hi ${firstName}, you had added to topic ${topic.name}`
        const emailToSend = {
            subject: subject,
            content: content
        }

        EmailUtils.sendOneMail(email, emailToSend)
    }
}

export default TopicService