import { QdrantClient } from "@qdrant/js-client-rest";
import logger from '../config/logger';
import { EmbeddingResult, JobEmbeddingResult } from "./OpenAIService";
import { randomUUID } from "crypto";
import { ResumePoint } from "@/types/resume.types";

export interface QdrantPoint {
  id: number | string;
  vector: number[];
  payload?: {
    industry?: string;
    'document-id'?: string;
    is_active?: boolean;
    section : string;
  };
}

export interface SearchResult {
  section : string,
  result  : {
    points: {
        id: string | number;
        version: number;
        score: number;
        payload?: Record<string, unknown> | {
            [key: string]: unknown;
        } | null | undefined;
        vector?: Record<string, unknown> | number[] | number[][] | {
            [key: string]: number[] | number[][] | {
                indices: number[];
                values: number[];
            } | undefined;
        } | null | undefined;
        shard_key?: string | number | Record<string, unknown> | null | undefined;
        order_value?: number | Record<string, unknown> | null | undefined;
    }[];
  }
}

export interface QdrantSchemaFilter {
  industry?: string;
  'candidate-email'?: string;
  'document-id'?: string;
  'candidate-name'?: string;
  is_active?: boolean;
  'candidate-id'?: string;
}



export class QdrantService {
  private client: QdrantClient;
  private defaultCollection: string = "jobs";

  constructor(collection: string = "jobs") {
    this.client = new QdrantClient({
      url: process.env.QDRANT_HOST || "https://f1e275e3-11eb-4c8d-ac0b-d1e7db4d5c0c.us-east4-0.gcp.cloud.qdrant.io",
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.defaultCollection = collection;
  }

 
  async uploadJobToQdrant(vectors : EmbeddingResult[], job: {
    id : string;
    industry: string;
    organizationId : string;
  }): Promise<any> {
    
    const transformedPayload : QdrantPoint[] = vectors.map((em)=>{
      return {
        id: randomUUID(),
        vector: em.embedding,
        payload: {
          industry: job.industry,
          'document-id': job.id,
          is_active: true,
          section : em.section,
        }
      }
    })
    return await this.uploadPoints(transformedPayload, "jobs");
  }

  /**
   * Upload/upsert points to Qdrant collection
   */
  async uploadPoints(transformedPoints: QdrantPoint[], collection?: string ): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      

      const operationInfo = await this.client.upsert(targetCollection, {
        wait: true,
        points: transformedPoints,
      });

      logger.info('Successfully uploaded points to Qdrant:', {
        status: operationInfo.status,
        operation_id: operationInfo.operation_id,
        points_count: transformedPoints.length
      });

      return operationInfo;
    } catch (error) {
      logger.error('Error uploading points to Qdrant:', {
        error: error instanceof Error ? error.message : error,
        points_count: transformedPoints.length,
        collection: collection || this.defaultCollection
      });
      throw new Error("Failed to upload to Qdrant...");
    }
  }

  async globalJobSearchUsingResume(
    embeddedSections: ResumePoint,
    limit: number = 10,
    collection?: string
  ): Promise<SearchResult[]> {
    const targetCollection = collection || this.defaultCollection;
    const searchResult: SearchResult[] = [];

    for (const [section, sectionValue] of Object.entries(embeddedSections)) {
      if (!sectionValue) continue; // skip undefined sections

      const result = await this.client.query(targetCollection, {
        query: sectionValue.vector,
        limit,
        with_payload: true,
      });

      searchResult.push({
        section,
        result,
      });
    }

    return searchResult;
  }


  /**
   * Perform filtered search with specific criteria
   */
  async filteredSearch(embeddedSections : JobEmbeddingResult[], candidates : string[], k : number,  collection?: string): Promise<SearchResult[]> {
    try {
      const targetCollection = collection || this.defaultCollection;

      const searchResult : SearchResult[] = [];
      
      for( const sections of embeddedSections){
        
        const result = await this.client.query(targetCollection, {
          query: sections.embedding,
          filter : {
            must:[
              { key: "candidate-id", match: { "any": candidates } }
            ]},
          limit: k,      
          with_payload: true,      
          },
    
        );

        searchResult.push({
          section: sections.section,
          result,
        })
      }
      return searchResult;
    } catch (error) {
      logger.error('Error performing filtered search:', error);
      throw error;
    }
  }

  /**
   * Delete points by IDs
   */
  async deletePointsByJobId( jobId: string,  collection?: string): Promise<any> {
      try {
        const targetCollection = collection || this.defaultCollection;
        
        // does the points exist ?
        const existingPoints = await this.client.query(targetCollection, {
          query: Array(1536).fill(0), // Dummy vector for existence check
          filter: { must: { key: "document-id", match: jobId } },
          limit: 1,
          with_payload: true,
        });
        
        if (existingPoints.points.length === 0) {
          return { status: 'ok', operation_id: null };
        }
        
        const deleteResult = await this.client.delete(targetCollection, {
          filter : { must: { key: "candidate-id", match: jobId } },
          wait: true
        });
        
        return deleteResult;
      } catch (error) {
        throw new Error(`Failed to delete vector entries for job: ${jobId}`);
      }
  }

  /**
   * Get point by job ID
   */
  async getPointByJobId(jobId: string, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      const point = await this.client.scroll(targetCollection, {
        filter: {
          must: [{
              key: "document-id",
              match: {
                value: jobId,
              },
            }],
        },
        limit: 1,
        with_payload: true,
        with_vector: false,
      });
      logger.info('retrieved point from the job vector : ', point.points[0]);
      return point;
    } catch (error) {
      logger.error(`Error retrieving job point with ${jobId}:`, error);
      throw error;
    }
  }


}


export const qdrantService = new QdrantService();

export default QdrantService;