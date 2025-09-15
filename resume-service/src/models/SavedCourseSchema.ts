import mongoose, { Document } from "mongoose";

// TypeScript interface for SavedCourse document
export interface ISavedCourse extends Document {
  candidateId: string;
  savedCourses: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SavedCourseSchema = new mongoose.Schema({
  candidateId: { type: String, required: true, unique: true },
  savedCourses: [{ type: String }],
}, {
  timestamps: true 
});

SavedCourseSchema.index({ candidateId: 1 });

export const SavedCourse = mongoose.model<ISavedCourse>("SavedCourse", SavedCourseSchema);