import { 
  CandidateInfo,
  InterviewData,
  ShortlistRequest,
} from '../types/aplication.types';
import { ApiError, asyncHandler } from '../utils';
import axios from 'axios';

// Status enum for job applications
enum ApplicationStatus {
  Pending = 'PENDING',
  Shortlisted = 'SHORTLISTED',
  Rejected = 'REJECTED',
  Accepted = 'ACCEPTED',
}
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { sendNotification } from '../utils/notify';
import { EventTypes, INotification } from '../types/notifications.types';
import logger from '../config/logger';

class ApplicationService{

  async applyToJob(jobId: string, candidateEmail: string, candidateId: string, candidateName: string): Promise<IJobDetailsDocument> {

        const existingJob = await JobDetailsModel.findById(jobId).orFail();

        const alreadyApplied = existingJob.applications?.some(app => app.candidateEmail === candidateEmail);
        if (alreadyApplied) {
          throw new ApiError(400,"User Already Applied to this job");
        }

        const application = {
          candidateEmail,
          candidateId,
          appliedAt : new Date(),
          status    : ApplicationStatus.Pending,
        };

        const updatedJob = await JobDetailsModel.findByIdAndUpdate(
          jobId,
          { $addToSet: { applications: application } },
          { new: true }
        ).orFail();

        if(updatedJob){
          const notification : INotification = {
            recieverEmail : updatedJob.company.OrganizationEmail,
            recieverId    : updatedJob.postedBy,
            type          : EventTypes.NEW_JOB_APPLICATION,
            title         : "New Job Application Recieved",
            message       : `${candidateName} applied for the position of ${updatedJob.title}`,
          }
          logger.info("Sending notification to Recruiter : ", notification);
          await sendNotification(notification,"notifications");
        }

        return updatedJob;
    }


    async withdrawApplication(jobId: string, candidateEmail: string, candidateId: string): Promise<IJobDetailsDocument> {
     
        const existingJob = await JobDetailsModel.findById(jobId).orFail();

        const applicationExists = existingJob?.applications?.some(
          app => app.candidateEmail === candidateEmail
        );
        
        if (!applicationExists) {
          throw new ApiError(400, "You never applied for this job. No such application found ");
        }

        return await JobDetailsModel.findByIdAndUpdate(
          jobId,
          { 
            $pull: { 
              applications: { 
                candidateEmail: candidateEmail
              } 
            } 
          },
          { new: true }
        ).orFail();
    }


  async shortlistCandidate(jobId: string, candidates : Array<CandidateInfo>): Promise<IJobDetailsDocument | null> {
    
    const candidateIds = candidates.map(candidate => candidate.candidateId);
    
    const job = await JobDetailsModel.findOneAndUpdate(
      { 
        _id: jobId, 
        "applications.candidateId": { $in: candidateIds } 
      },
      { 
        $set: { 
          "applications.$[elem].status": ApplicationStatus.Shortlisted 
        } 
      },
      { 
        new: true,
        arrayFilters: [{ "elem.candidateId": { $in: candidateIds } }]
      }
    ).orFail();

    if(job?.interviewQA?.length != 0 ){
      this.sendInterviewInvitation(candidates, jobId);
    }

    return job;
  }

  async finalizeCandidate(jobId: string, candidates : Array<CandidateInfo>): Promise<IJobDetailsDocument | null> {
    
    const candidateIds = candidates.map(candidate => candidate.candidateId);
    
    const job = await JobDetailsModel.findOneAndUpdate(
      { 
        _id: jobId, 
        "applications.candidateId": { $in: candidateIds } 
      },
      { 
        $set: { 
          "applications.$[elem].status": ApplicationStatus.Accepted,
        } 
      },
      { 
        new: true,
        arrayFilters: [{ "elem.candidateId": { $in: candidateIds } }]
      }
    ).orFail();

    this.sendFinalistNotification(candidates,jobId);

    return job;
  }
  
  async sendInterviewInvitation(candidates: CandidateInfo[], jobId: string): Promise<void> {

    const job = await JobDetailsModel.findById(jobId).orFail();
   
    for (const candidate of candidates) {
      const response = await axios.post(`${process.env.INTERVIEW_SERVICE_URL}/api/interview`, {
        candidate: {
          id    : candidate.candidateId,
          email : candidate.candidateEmail,
          name  : candidate.candidateName,
        },
        job: {
          id          : job._id.toString(),
          title       : job.title,
          interviewQA : job.interviewQA || [],
        },
        organization : {
          id  : job.company.OrganizationId,
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //(7 days )
      });
      
      const interview: InterviewData = response.data.data;
      
      //sending email to the candidate
      const notification  = {
        type             : EventTypes.JOB_APPLICATION_SHORTLISTED,
        candidateId      : candidate.candidateId,
        candidateName    : candidate.candidateName,
        candidateEmail   : candidate.candidateEmail,
        jobTitle         : job.title,
        OrganizationId   : job.company.OrganizationId,
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


  async sendFinalistNotification(candidates: CandidateInfo[], jobId: string): Promise<void> {
    
    const job = await JobDetailsModel.findById(jobId).orFail();

    for (const candidate of candidates) {
      
      //sending email to the candidate
      const notification  = {
        type             : EventTypes.JOB_APPLICATION_ACCEPTED,
        candidateId      : candidate.candidateId,
        candidateName    : candidate.candidateName,
        candidateEmail   : candidate.candidateEmail,
        jobTitle         : job.title,
        OrganizationId   : job.company.OrganizationId,
        OrganizationName : job.company.OrganizationName || " No name Found ",
        OrganizationEmail: job.company.OrganizationEmail,
        guideLink        : 'https://github.com/Imran-2020331101',
      };
      console.log(notification);

      sendNotification(notification, "email-notification");
    }
  }

}

export const applicationService = new ApplicationService();