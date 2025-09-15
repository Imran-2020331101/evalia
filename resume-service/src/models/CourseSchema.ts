import mongoose, { Document } from "mongoose";

// Thumbnail interface for YouTube video thumbnails
export interface IThumbnails {
  default?: {
    url: string;
    width: number;
    height: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
  };
  high?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface SearchResult {
  courses       : ICourse[],
  nextPageToken : number,
  totalResults  : number,
}

// Course interface
export interface ICourse extends Document {
  videoId: string;
  title: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  thumbnails?: IThumbnails;
  publishedAt?: Date;
}

const CourseSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  channelId: { type: String },
  channelTitle: { type: String },
  thumbnails: { type: Object }, // store default, medium, high URLs
  publishedAt: { type: Date },
});

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
