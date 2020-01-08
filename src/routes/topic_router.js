import { Router } from "express"
import TopicController from "../controllers/topic_controller"
import QuestionController from "../controllers/question_controller"
import * as PermissionMiddleware from "../middlewares/permission_middleware"

const router = Router()
const topicController = new TopicController()
const questionController = new QuestionController()

router.route("/")
    .post(topicController.createRecord)
    .get(topicController.getMyTopics)

router.get("/joined", topicController.getJoinTopics)

router.get("/:recordId", topicController.getRecordById)

router.get("/:recordId/members", PermissionMiddleware.validateTopicMemberPermission)

router.route("/:recordId/members")
    .post(topicController.addMembersToTopic)
    .delete(topicController.removeMembersFromTopic)
    .get(topicController.getMembersOfTopic)

router.use("/:recordId/questions", PermissionMiddleware.validateTopicMemberPermission)

router.route("/:recordId/questions")
    .post(questionController.createTopicQuestion)

router.route("/:recordId")
    .patch(topicController.updateRecord)
    .delete(topicController.deleteRecordById)

export default router