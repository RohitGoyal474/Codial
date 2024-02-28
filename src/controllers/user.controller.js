import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/User.model.js";
import {uploadOnCloudinary} from "../utils/cloudInary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// function for access refreshToken and accessToken
const accessAndRefreshToken=async(userid)=>{
    try {
        const user=User.findById(userid)
        if(!user){
            throw new ApiError(405,"access and refresh yoken could not genrate,user not found")
        }
        const refreshToken=await user.generateRefreshToken()
        const accessToken=await user.generateAccessToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        
        return {refreshToken,accessToken};
    } catch (error) {
         throw new ApiError(405,"access and refresh yoken could not genrate")
    }  
}
    

// register user
const registerUser = asyncHandler(async (req, res) => {
    

    const { fullname,username, email, password } = req.body;

    console.log(username, email, password);
    
    if(
        [fullname, username, email, password].some(field => field?.trim() === "")){
            throw new ApiError(400, "All fields are required");
    }
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(400, "User already exists");
    }


    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files.avatar);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    console.log(avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatar) ;
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullname: fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const userLogin= asyncHandler(async(req,res)=>{
    
    if(!username && !email){
        throw new ApiError(400, "username and email both are required")
    }
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    if(!existedUser){
        throw new ApiError(400, "User does not exist")
    }
    const ispasswordMatched=await existedUser.comparePassword(password);
    if(!ispasswordMatched){
        throw new ApiError(401, "Invalid credentials")
    }
    const {refreshToken,accessToken}=await accessAndRefreshToken(existedUser._id);
    
    // where existedUser dont have refresh token and also contain password;
    const logedUser=await User.findById(existedUser._id).select("-password -refreshToken")
    if(!logedUser){
        throw new ApiError(400,"something went wrong during loged user")
    }
    const option={
        httpOnly:true,
        secure:true

    }
    res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .ApiResponse(
        200,{user:logedUser,accessToken,refreshToken},"user loged in successfully")
}) 
 
const userLogout=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


export { registerUser,userLogin,userLogout }