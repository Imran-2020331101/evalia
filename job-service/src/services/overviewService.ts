import { ExtractedResume } from "../types/overview.types";
import logger from "../config/logger";
import axios from 'axios'

class overviewService {

  async evaluateCandidateProfile(jobId :string, candidate_email: string){
      const response = await axios.post(`${process.env.RESUME_SERVICE_URL}`, { email: candidate_email })
      console.log(response);
      if(response.status != 200){
        logger.error("Failed to retrieve resume by email. resume-service returned: ", response.status);
        return
      }
  }

}

export const OverviewService = new overviewService();