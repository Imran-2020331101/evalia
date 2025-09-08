import { 
  CandidateInfo,
  InterviewData,
} from '../types/aplication.types';
import { asyncHandler } from '../utils';
import axios from 'axios';

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
  
  async sendInterviewInvitation(candidates: CandidateInfo[], jobId: string): Promise<void> {

    const job = await JobDetailsModel.findById(jobId).orFail();
   
    for (const candidate of candidates) {
      const response = await axios.post(`${process.env.INTERVIEW_SERVICE_URL}/api/interview`, {
        candidate: {
          id: candidate.candidateId,
          email: candidate.candidateEmail,
          name: candidate.candidateName,
        },
        job: {
          id: job._id.toString(),
          title: job.title,
          interviewQA: job.interviewQA || [], // Assuming this field exists in your job model
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      
      const interview: InterviewData = response.data.data;
      
      const notification = {
        type          : 'job.application.shortlisted',
        candidateName : candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        jobTitle      : job.title,
        OrganizationName : job.company.OrganizationName || " No name Found ",
        OrganizationEmail: job.company.OrganizationEmail,
        deadline         : interview.deadline,
        guideLink        : 'https://github.com/Imran-2020331101',
        interviewLink : `${process.env.FRONTEND_URL}/workspace/interviews/on-going/${interview.interviewId}`,
      };
      console.log(notification);

      sendNotification(notification, "email-notification");
    }
  }

}

export const applicationService = new ApplicationService();