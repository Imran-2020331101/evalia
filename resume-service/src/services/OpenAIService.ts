import OpenAI from "openai";
import logger from '../utils/logger';
import { ResumeData } from "../types/resume.types";
import {z} from 'zod';

  export interface BatchEmbeddingInput {
    section : string;
    text    : string;
  }

  const EmbeddingResponse = z.array(
    z.object({
      section: z.string(),
      embedding: z.array(z.number())
    })
  );

  export type EmbeddingResult = z.infer<typeof EmbeddingResponse>[number];

  export interface JobEmbeddingResult {
    section : string;
    embedding : number[];
  }

  export class OpenAIService {
    private openai: OpenAI;
    private defaultModel: string;

    constructor(apiKey?: string) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.defaultModel = 'text-embedding-3-small';
  }

  /**
   * Create embedding from a single text string
   */
  async createEmbedding( text: string ): Promise<number[]> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text input cannot be empty');
      }

      const response = await this.openai.embeddings.create({
        model: this.defaultModel || 'text-embedding-3-small',
        input: text.trim(),
        encoding_format: "float",
      });

      const embedding = response.data[0].embedding;
      
      return embedding;
    } catch (error) {
      logger.error('Error creating embedding:', error);
      throw error;
    }
  }

  /**
   * Create embeddings for multiple texts in batch
   */

async createBatchEmbeddings( inputs: BatchEmbeddingInput[] ): Promise<EmbeddingResult[]> {

  if (!inputs || inputs.length === 0) {
    throw new Error("Failed to Vectorize Resume : Inputs are empty");
  }

  const results: EmbeddingResult[] = await Promise.all(
    inputs.map(async (sc) => {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: sc.text,
        encoding_format: "float",
      });

      return {
        section: sc.section,
        embedding: response.data[0].embedding,
      };
    })
  );

  return results;
}



  /**
   * Create embeddings for all resume sections in batch (optimized for Qdrant)
   */
  async createResumeEmbeddings(resumeData: ResumeData ): Promise<EmbeddingResult[]> {

      const batchInputs: BatchEmbeddingInput[] = [];

      if (resumeData.skills) {
        const skillsText : string = Array.isArray(resumeData.skills) 
          ? resumeData.skills.join(', ')
          : typeof resumeData.skills === 'object'
          ? Object.values(resumeData.skills).flat().join(', ')
          : String(resumeData.skills);
        
        if (skillsText && skillsText.trim()) {
          console.log('Condensed Skills text : ', skillsText);
          batchInputs.push({
            section : 'skills',
            text: skillsText,
          });
        }
      }

      // Prepare experience embedding
      if (resumeData.experience && resumeData.experience.length > 0) {
        const experienceText = resumeData.experience
          .map(exp => `${exp.job_title} at ${exp.company}: ${exp.description}`)
          .join('. ');
        
        console.log('Condensed experience text : ', experienceText);
        batchInputs.push({
          section: 'experience',
          text: experienceText,
        });
      }

      // Prepare education embedding
      if (resumeData.education && resumeData.education.length > 0) {
        const educationText = resumeData.education
          .map(edu => `${edu.degree} from ${edu.institution}`)
          .join('. ');
        
        batchInputs.push({
          text: educationText,
          section: 'education'
      });
      }

      // Prepare projects embedding
      if (resumeData.projects && resumeData.projects.length > 0) {
        const projectsText = resumeData.projects
          .map(project => `${project.title}: ${project.description}`)
          .join('. ');
        
         console.log('Condensed projects text : ', projectsText);
        batchInputs.push({
          section : 'project',
          text: projectsText,
        });
      }

      return await this.createBatchEmbeddings(batchInputs);
      
  }



  /**
   * Create embedding for job descriptions 
   */
  async createJobEmbedding(skills : string, experience: string, projects: string, education: string): Promise<JobEmbeddingResult[]> {
    try {
      const inputs = [
      { section: "skills",      value: skills },
      { section: "experience",  value: experience },
      { section: "projects",    value: projects },
      { section: "education",   value: education },
    ].filter(item => item.value && item.value.trim().length > 0); // skip empty fields

    const embeddings: JobEmbeddingResult[] = [];

    for (const input of inputs) {
      const embedding = await this.createEmbedding(input.value);
      embeddings.push({
        section: input.section,
        embedding,
      });
    }

    return embeddings;
    } catch (error) {
      logger.error('Error creating job description embedding:', error);
      throw error;
    }
  }


}


export const openAIService = new OpenAIService();

export default OpenAIService;