import asyncHandler from "../utils/asyncHandler"
import ApiError from "../utils/apiErrors"
import  Jwt  from "jsonwebtoken"
import { User } from "../models/User.model"


const verifyJWT=asyncHandler(async(req,res,next)=>{
try {
        const token=req.cookies.refreshToken || req.headers(authorization)?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"please login or signup")
        }
        const decoded=Jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decoded?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"please login or signup")
        }
        req.user=user
        next()
} catch (error) {
    throw new ApiError(401,"please login or signup")
}
 
})
export{verifyJWT}