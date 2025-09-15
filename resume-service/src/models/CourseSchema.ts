import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  channelId: { type: String },
  channelTitle: { type: String },
  thumbnails: { type: Object }, // store default, medium, high URLs
  publishedAt: { type: Date },
});

export const Course = mongoose.model("Course", CourseSchema);
