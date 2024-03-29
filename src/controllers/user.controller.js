import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudInary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// function for access refreshToken and accessToken
const accessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(
        405,
        "access and refresh token could not genrate,user not found"
      );
    }
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(405, "access and refresh yoken could not genrate");
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  console.log(req.body);

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }
 
  //   const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(req.files.avatar);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //   if (!avatarLocalPath) {
  //     throw new ApiError(400, "Avatar file is required");
  //   }
  //   console.log(avatarLocalPath);
  //   const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //   console.log(avatar);
  //   if (!avatar) {
  //     throw new ApiError(400, "Avatar file is required");
  //   }

  const user = await User.create({
    fullname: fullname,
    // avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  await Account.create({
    userId:user._id,
    balance: 1 + Math.random() * 10000,
  });
  const { refreshToken, accessToken } = await accessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  const options = {
    
    
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email) {
    throw new ApiError(400, "username and email both are required");
  }
  const existedUser = await User.findOne( {
    $or: [{ username: email }, { email }],
  });
  if (!existedUser) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { refreshToken, accessToken } = await accessAndRefreshToken(
    existedUser._id
  );

  console.log("//////////");
  console.log(refreshToken);

  // where existedUser dont have refresh token and also contain password;
  const logedUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );
  if (!logedUser) {
    throw new ApiError(400, "something went wrong during loged user");
  }
  const options = {
   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { 
          user: logedUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  r;
  const newRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!newRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  const decoded = Jwt.verify(newRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const { refreshToken, accessToken } = await accessAndRefreshToken(user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Access token refreshed successfully"
      )
    );
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, password, confPassword } = req.body;
  if (!password || !oldPassword || !confPassword) {
    throw new ApiError(400, "Invalid input while changing password");
  }
  if (password !== confPassword) {
    throw new ApiError(400, "Password and confirm password does not match");
  }

  const user = User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = password;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "User found successfully"));
});
const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullname } = req.body;
  if (!username || !fullname) {
    throw new ApiError(400, "Invalid input while updating profile");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username,
        fullname,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});
const updateAvatar = asyncHandler(async (req, res) => {
  const localAvatarPath = req.file?.path;
  if (!localAvatarPath) {
    throw new ApiError(400, "Invalid input while updating Avatar profile");
  }
  const avatar = await uploadOnCloudinary(localAvatarPath);
  if (!avatar) {
    throw new ApiError(
      400,
      "Invalid input while uploading avatar path to cloudnary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const localCoverImagePath = req.file?.path;
  if (!localCoverImagePath) {
    throw new ApiError(400, "Invalid input while updating coverImage profile");
  }
  const coverImage = await uploadOnCloudinary(localCoverImagePath);
  if (!coverImage) {
    throw new ApiError(
      400,
      "Invalid input while uploading avatar path to cloudnary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"));
});
  const SearchUser = asyncHandler(async (req, res) => {
    const filter = req.query.filter || "";
 
    const users = await User.find({
      $or: [
        {
          username: {
            $regex: filter,
          },
        },
        {
          fullname: {
            $regex: filter,
          },
        },
      ],
    });
    
    res.json({
      user: users.map((user) => ({
        username: user.username,
        fullname: user.fullname,
        _id: user._id,
      })),
    });
  })
export {
  registerUser,
  userLogin,
  userLogout,
  refreshAccessToken,
  updateUserPassword,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  updateUserCoverImage,
  SearchUser,
};
