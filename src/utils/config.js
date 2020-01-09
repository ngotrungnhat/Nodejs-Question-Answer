const env = process.env.NODE_ENV || "development"
const configData = require(`../../configs/${env}.json`)

export default configData