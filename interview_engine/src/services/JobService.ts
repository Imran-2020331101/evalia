import axios, { AxiosResponse } from 'axios';
import { IJobResponse } from '../types/interview';

export class JobService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://localhost:7000';
  }

  async getJobById(jobId: string): Promise<IJobResponse> {
    try {
      const response: AxiosResponse<IJobResponse> = await axios.get(
        `${process.env.JOB_SERVICE_URL}/api/jobs/${jobId}`
      );
    //   console.log(response);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }
}

export const jobService = new JobService();
