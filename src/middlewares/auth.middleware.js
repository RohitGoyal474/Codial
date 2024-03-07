import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrors.js"
import  Jwt  from "jsonwebtoken"
import { User } from "../models/User.model.js"



export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token =
          req.cookies.accessToken; 
        //   req.header("accessToken");
        console.log("------------------");
        console.log(token)
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

/// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWUzNDljZDZjMDRiMzk1OGIyNDk2MDgiLCJlbWFpbCI6InJvaGl0Z295YWxAZ21haWwuY29tIiwidXNlcm5hbWUiOiJyb2hpdDEyMyIsImlhdCI6MTcwOTU2Nzc1NSwiZXhwIjoxNzA5NjU0MTU1fQ.KaB6xdVM2FpB8aXp1WYBWLALNWW8xuS1XdX4DFst-i0"