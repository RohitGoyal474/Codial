import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userLogout } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userLogin } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { uploadVideo } from "../controllers/video.controller.js";
import { getVideoDetails } from "../controllers/video.controller.js";
import { getPhotoDetails, uploadPhoto } from "../controllers/photo.controller.js";

const router = Router();

router.route("/register").post(
  // upload is multer middleware
  // this store this avatar and cover imgae in public/temp
  // this will give req.file
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT, userLogout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router.route("/get-video").get(verifyJWT, getVideoDetails);
router.route("/get-photo").get(verifyJWT, getPhotoDetails);
router.route("/upload-video").post(
  upload.fields([
    {
      name: "videoFile", // Specify the field name
      maxCount: 1, // Specify the maximum number of files allowed for this field
    },
    {
      name: "thumbnail", // Specify the field name
      maxCount: 1, // Specify the maximum number of files allowed for this field
    },
  ]),
  verifyJWT,
  uploadVideo
);
router.route("/upload-photo").post(
  upload.fields([
    {
      name: "photoFile", // Specify the field name
      maxCount: 1, // Specify the maximum number of files allowed for this field
    },
  ]),
  verifyJWT,
  uploadPhoto
);
  
export default router;
