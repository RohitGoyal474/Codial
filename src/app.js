import express from "express";
const app=express();
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static("public"));

/// router import
import userRouter from "./routes/user.routes.js";

// route declaration
app.use("/api/vi/users",userRouter);



export{app}
