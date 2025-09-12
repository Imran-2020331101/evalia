import { Metadata } from "@/types/resume.types";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExtractedResume extends Document{
    userId     : string;
    userEmail  : string;
    text: string;
    metadata: Metadata;
}

const ExtractedResumeSchema = new Schema<IExtractedResume>(
    {
        userId    : { type : String, required: true},
        userEmail : String,
        metadata  : {
          pages  : Number,
          info   : Schema.Types.Mixed,
          version: String,
        },
        text      : {type: String, required: true}
    }
)

export const ExtractedResume: Model<IExtractedResume> = mongoose.model<IExtractedResume>('ExtractedResume', ExtractedResumeSchema);