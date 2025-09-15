import Resume, { IResume } from "../models/Resume";
import { asyncHandler } from "../middleware/errorHandler";
import { Request, Response } from 'express';
import { courseService } from "../services/courseService";
import { BadRequestError } from "../errors";
import { ICourse, SavedCourse } from "../models/SavedCourseSchema";

class CourseController{
    personalizedCourseSuggestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { candidateEmail } = req.query;

        if (!candidateEmail) {
            throw new BadRequestError('Candidate email is required');
        }
        
        const resume = await Resume.findOne({ uploadedBy: candidateEmail }).orFail(
            new Error(`Resume not found for email: ${candidateEmail}`)
        );

        console.log(resume);

        const keywords    = this.extractKeywords(resume);
        
        const queryString = keywords.join(' ');

        console.log(queryString);

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
        const {
            videoId,
            title,
            description,
            channelId,
            channelTitle,
            thumbnails,
            publishedAt,
            }  = req.body;
        
        const { candidateId } = req.params;

        if (!candidateId || !videoId) {
            throw new BadRequestError('Candidate ID and Video ID are required');
        }

        let savedCourses = await SavedCourse.findOne({ candidateId });

        const courseData = {
            videoId,
            title,
            description,
            channelId,
            channelTitle,
            thumbnails,
            publishedAt,
        };

        if (!savedCourses) {
            savedCourses = await SavedCourse.create({
                candidateId,
                savedCourses: [courseData],
            });
        } else {
            const existingCourse = savedCourses.savedCourses.find(course => course.videoId === videoId);
            if (!existingCourse) {
                savedCourses.savedCourses.push(courseData as any);
                await savedCourses.save();
            }
        }

        res.status(200).json({
            success: true,
            data: savedCourses
        });
    });


    fetchSavedCourses = asyncHandler(async (req: Request,res: Response): Promise<void> =>{
        const {candidateId } = req.body;
        const courses = SavedCourse.find({candidateId});
        res.status(200).json({
                success : true,
                data    : courses
            })
    });

    removeCourseFromSavedList = asyncHandler(async (req: Request, res: Response): Promise<void> =>{
        const {candidateId, videoId} = req.params;
        
        if (!candidateId || !videoId) {
            throw new BadRequestError('Candidate ID and Video ID are required');
        }

        const savedCourses = await SavedCourse.findOne({candidateId}).orFail(
            new Error(`Saved courses not found for candidate: ${candidateId}`)
        );
        
        const updatedCourseList = savedCourses.savedCourses.filter((video) => video.videoId !== videoId);
        savedCourses.savedCourses = updatedCourseList;
        await savedCourses.save();

        res.status(200).json({
            success: true,
            message: 'Course removed successfully',
            data: savedCourses
        });
    })

}

export const courseController = new CourseController();