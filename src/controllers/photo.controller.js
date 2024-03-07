import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudInary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Photo } from "../models/Photo.model.js";

const uploadPhoto = asyncHandler(async (req, res) => {
  const { description, title } = req.body;
  if ([description, title].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  console.log(req.files);
  const photoLocalPath = req.files?.photoFile[0]?.path;
  if (!photoLocalPath) {
    throw new ApiError(400, "photo is required");
  }

  const PhotoUpload = await uploadOnCloudinary(photoLocalPath);
  if (!PhotoUpload) {
    throw new ApiError(400, "photo not uploaded");
  }

  const ownerId = req.user._id;
  const photo = await Photo.create({
    photoFile: PhotoUpload.url,
    description,
    title,
    owner: ownerId,
  });

  const createdPhoto = await Photo.findById(photo._id).populate("owner");
  if (!createdPhoto) {
    throw new ApiError(500, "something went wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, createdPhoto, "photo uploaded successfully"));
});

const getPhotoDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  console.log("user", user);
  if (!user) {
    throw new ApiError(500, "something went wrong");
  }
  const photos = await Photo.find({ owner: user._id }).exec();
  if (!photos) {
    throw new ApiError(500, "something went wrong");
  }
  console.log("photos", photos);
  res
    .status(200)
    .json(new ApiResponse(200, photos, "photos fetched successfully"));
});

export { uploadPhoto, getPhotoDetails };
