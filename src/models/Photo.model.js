import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PhotoSchema = new Schema(
  {
    photoFile: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    
    views: {
      type: Number,
      default: 0,
    },
    isPublish: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

PhotoSchema.plugin(mongooseAggregatePaginate);
export const Photo = mongoose.model("Photo", PhotoSchema);