import OpenAI from "openai";
import logger from '../config/logger';
import {z} from 'zod';


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