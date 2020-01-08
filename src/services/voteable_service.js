import BaseService from "./base_service"

class VoteableService extends BaseService {
    constructor(dao) {
        super(dao)
    }

    async countUpVoteById(recordId) {
        const record = await this.dao.getRawRecordById(recordId)

        if (!record) {
            return
        }

        await this.countUpVoteOfRecord(record)
    }

    async countDownVoteById(recordId) {
        const record = await this.dao.getRawRecordById(recordId)

        if (!record) {
            return
        }

        await this.countDownVoteOfRecord(record)
    }

    async countUpVoteOfRecord(record) {
        record.voteCount = record.voteCount + 1

        await this.dao.updateRecord(record)
    }

    async countDownVoteOfRecord(record) {
        record.voteCount = record.voteCount - 1

        await this.dao.updateRecord(record)
    }

    async countDownVotesOfRecord(record, numOfVote) {
        record.voteCount = record.voteCount - numOfVote

        await this.dao.updateRecord(record)
    }

    async countDownVotesById(recordId, numOfVote) {
        const record = await this.dao.getRawRecordById(recordId)

        if (!record) {
            return
        }

        record.voteCount = record.voteCount - numOfVote

        await this.dao.updateRecord(record)
    }
}

export default VoteableService