import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudInary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// making upload video
const uploadVideo = asyncHandler(async (req, res) => {
  const { description, title } = req.body;
  if ([description, title].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video is required");
  }

const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
if (!thumbnailLocalPath) {
  throw new ApiError(400, "thumbnail is required");
}

  const VideoUpload = await uploadOnCloudinary(videoLocalPath);
  if (!VideoUpload) {
    throw new ApiError(400, "video not uploaded");
  }

const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
if (!thumbnailUpload) {
  throw new ApiError(400, "thumbnail not uploaded");
}


  
  const ownerId = req.user._id;
  const video = await Video.create({
    videoFile: VideoUpload.url,
    thumbnail: thumbnailUpload.url,
    description,
    title,
    owner: ownerId,
  });

  const createdVideo = await Video.findById(video._id).populate("owner");
  if (!createdVideo) {
    throw new ApiError(500, "something went wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "video uploaded successfully"));
});

const getVideoDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  console.log("user", user);
  if (!user) {
    throw new ApiError(500, "something went wrong");
  }
  const videos = await Video.find({ owner: user._id }).exec();
  if (!videos) {
    throw new ApiError(500, "something went wrong");
  } 
  console.log("videos", videos);
  res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});
 
export { uploadVideo, getVideoDetails };
 
/*

DASHBOARD====
FIRST CALL WILL BE TO FETCH DATA ABOUT USER--
    FOR THIS WE USER GET USERDATA
    SECOND CALL WILL BE ABOUT GETTING ALL USER VIDEO THIS WILL STORE IN A Array
    THIS CAN BE DONE BY PIPELINE OF MONGOOSE, AGGREGATE

video upload call by user-
   in this we belive that user is login and we expect a user payload along with the call;
   or we can take user detail by req.user;
   FIRST CALL WILL BE TO FETCH DATA ABOUT USER
    SECOND CALL WILL BE TO UPLOAD VIDEO TO CLOUDINARY
    THIS CAN BE DONE BY PIPELINE OF MONGOOSE, AGGREGATE
*/
