import { Router } from "express"
import QuestionAnswerController from "../controllers/question_answer_controller"

const router = Router()

const questionAnswerController = new QuestionAnswerController()

router.route("/")
    .post(questionAnswerController.createRecord)
    .get(questionAnswerController.getRecords)

router.get("/:recordId", questionAnswerController.getRecordById)

router.route("/:recordId")
    .delete(questionAnswerController.deleteRecord)
    .patch(questionAnswerController.updateRecord)

router.route("/:recordId/votes")
    .post(questionAnswerController.voteQuestionAnswer)
    .delete(questionAnswerController.unVoteQuestionAnswer)

export default router