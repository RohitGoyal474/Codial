import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userLogout } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userLogin } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";


const router=Router();

router.route("/register").post(
    // upload is multer middleware
    // this store this avatar and cover imgae in public/temp
    // this will give req.file
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT,userLogout)
router.route("/refresh-token").post(refreshAccessToken)
export default router