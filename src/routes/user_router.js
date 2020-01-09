import { Router } from "express"
import UserController from "../controllers/user_controller"
import * as authMiddleware from "../middlewares/auth_middleware"

const router = Router()
const userController = new UserController()

router.post("/active", userController.activeNormalUser)
router.post("/active/resend-code", userController.sendActiveUserCode)
router.post("/password/forgot", userController.forgotPasswordOfNormalUser)
router.patch("/password/update-by-code", userController.updatePasswordByCodeOfNormalUser)

router.post("/", userController.createNormalUser)

router.use("/", authMiddleware.verifyAuth)

router.patch("/password/change", userController.changePasswordOfNormalUser)
router.route("/profile")
    .patch(userController.updateProfileOfNormalUser)
    .get(userController.getMyProfile)

export default router