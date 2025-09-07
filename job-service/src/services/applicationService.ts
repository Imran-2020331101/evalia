import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  CreateJobRequest,
  JobDetails
} from '../types/job.types';
// Status enum for job applications
enum ApplicationStatus {
  Pending = 'PENDING',
  Shortlisted = 'SHORTLISTED',
  Rejected = 'REJECTED',
}
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { Types } from 'mongoose';
import { logger } from '../config/logger';
import { sendNotification } from '../utils/notify';
import { mapJobData } from '../utils/jobMapper';
import { ApplicationCompatibilityService } from './ApplicationCompatibilityService';


class ApplicationService{

  async shortlistCandidate(jobId: string, candidateIds : Array<string>): Promise<IJobDetailsDocument[]> {

    const job = candidateIds.map(async ( id )=>{
        return await JobDetailsModel.findOneAndUpdate(
            { _id: jobId, "applications.candidateId": id },
            { $set: { "applications.$.status": ApplicationStatus.Shortlisted } },
            { new: true }
            ).orFail();
    }) 

    return Promise.all(job);
  }
    
}

export const applicationService = new ApplicationService();