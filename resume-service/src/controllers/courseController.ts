import Resume, { IResume } from "../models/Resume";
import { asyncHandler } from "../middleware/errorHandler";
import { Request, Response } from 'express';
import { Analysis } from "../types/resume.types";
import { courseService } from "@/services/courseService";
import { BadRequestError } from "../errors";
import { SavedCourse } from "@/models/SavedCourseSchema";

class CourseController{
    personalizedCourseSuggestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { candidateEmail } = req.query;

        if (!candidateEmail) {
            throw new BadRequestError('Candidate email is required');
        }

        const resume = await Resume.findOne({ uploadedBy: candidateEmail }).orFail(
            new Error(`Resume not found for email: ${candidateEmail}`)
        );

        const keywords = this.extractKeywords(resume);
        
        const queryString = keywords.join(' ');

        const suggestions = await courseService.searchYoutube(queryString, 10);

        res.status(200).json({
            success: true,
            data: suggestions,
        });
    });

    /**
     * Extract relevant keywords from resume for course suggestions
     */
    private extractKeywords(resume: any): string[] {
        const keywords: string[] = [];
        
        if (resume.analysis?.keywords?.length) {
            keywords.push(...resume.analysis.keywords);
        }
        
        if (keywords.length === 0 && resume.skills?.technical?.length) {
            keywords.push(...resume.skills.technical.slice(0, 5)); // Limit to top 5
        }
        
        if (keywords.length === 0 && resume.industry) {
            keywords.push(resume.industry);
        }
        
        if (keywords.length === 0) {
            keywords.push('professional development');
        }

        return keywords.filter(Boolean).slice(0, 8);
    }

    saveCourse = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const { candidateId, videoId } = req.params;
        
        if (!candidateId || !videoId) {
            throw new BadRequestError('Candidate ID and Video ID are required');
        }

        let savedCourses = await SavedCourse.findOne({ candidateId });

        if (!savedCourses) {
            savedCourses = await SavedCourse.create({
                candidateId,
                savedCourses: [videoId],
            });
        } else {
            if (!savedCourses.savedCourses.includes(videoId)) {
                savedCourses.savedCourses.push(videoId);
                await savedCourses.save();
            }
        }

        res.status(200).json({
            success: true,
            data: savedCourses
        });
    });
}

export const courseController = new CourseController();