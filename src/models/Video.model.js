import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema=new Schema(
    {
        videFile:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        tile:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublish:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.type.ObjectId,
            ref: "User"
        },
    },{
        timestamps:true
    }
)

VideoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",VideoSchema)