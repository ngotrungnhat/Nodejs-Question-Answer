class BaseDAO {
    constructor(schema) {
        this.schema = schema
    }

    async getRecordById(id) {
        const record = await this.schema.findById(id)
        return record
    }

    async deleteRecordById(id) {
        await this.schema.findByIdAndDelete(id)
    }

    async insertRecord(recordData) {
        const record = new this.schema(recordData)
        await record.save()

        return record
    }

    async updateRecord(record) {
        await record.save()
    }

    async getRawRecordById(id) {
        const record = await this.schema.findById(id)
        return record
    }

    async getRawRecordsByIds(ids) {
        const conditions = {
            _id: {
                $in: ids
            }
        }

        const records = await this.schema.find(conditions)

        return records
    }

    async countRecords(conditions) {
        const result = await this.schema.countDocuments(conditions)
        return result
    }
}

export default BaseDAO