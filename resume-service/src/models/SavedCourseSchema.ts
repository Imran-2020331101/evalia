import mongoose, { Document } from "mongoose";


export interface SearchResult {
  courses       : ICourse[],
  nextPageToken : number,
  totalResults  : number,
}

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


export interface ICourse extends Document {
  videoId: string;
  title: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  thumbnails?: IThumbnails;
  publishedAt?: Date;
}

// TypeScript interface for SavedCourse document
export interface ISavedCourse extends Document {
  candidateId: string;
  savedCourses: ICourse[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SavedCourseSchema = new mongoose.Schema({
  candidateId: { type: String, required: true, unique: true },
  savedCourses: [{
    videoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    channelId: { type: String },
    channelTitle: { type: String },
    thumbnails: { type: Object },
    publishedAt: { type: Date },
  }],
}, {
  timestamps: true 
});

SavedCourseSchema.index({ candidateId: 1 });

export const SavedCourse = mongoose.model<ISavedCourse>("SavedCourse", SavedCourseSchema);