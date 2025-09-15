import { asyncHandler } from "../middleware/errorHandler";
import { Request, Response } from 'express';

class CourseController{
    personalizedCourseSuggestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { candidateId } = req.params;
        
        

    })
}

export const courseController = new CourseController();