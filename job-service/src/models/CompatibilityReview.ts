import mongoose, { Schema, Document } from 'mongoose';

export interface ICompatibilityReview extends Document {
	jobId: string;
	candidateEmail: string;
	matchPercentage: number;
	fit: 'Best Fit' | 'Good Fit' | 'Average' | 'Bad Fit';
	strengths: string[];
	weaknesses: string[];
	reviewedAt: Date;
}

const CompatibilityReview = new Schema<ICompatibilityReview>({
	jobId: { type: String, required: true, index: true },
	candidateEmail: { type: String, required: true, index: true },
	matchPercentage: { type: Number, required: true },
	fit: {
		type: String,
		enum: ['Best Fit', 'Good Fit', 'Average', 'Bad Fit'],
		required: true,
	},
	strengths: { type: [String], default: [] },
	weaknesses: { type: [String], default: [] },
	reviewedAt: { type: Date, default: Date.now },
});

export const CompatibilityReviewModel = mongoose.model<ICompatibilityReview>('compatibility_review', CompatibilityReview);
