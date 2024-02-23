import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";

const UserSchema=new Schema(
    {   
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
         email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
        },
         fullname:{
            type:String,
            required:true,           
            trim:true,
            index:true
        },
         userImage:{
            type:String,
            required:true,
            
        },
         coverImage:{
            type:String,
        },
        watchHistory:{
            type:Schema.type.ObjectId,
            ref: Video
            
        },
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String,
            
        }
     
    },
    {
        timestamps:true
    }
)

UserSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})
UserSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}
export const User=mongoose.model("User",UserSchema)