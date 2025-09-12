import { QdrantClient } from "@qdrant/js-client-rest";
import logger from '../utils/logger';
import { EmbeddingResult, JobEmbeddingResult } from "./OpenAIService";
import { randomUUID } from "crypto";

export interface QdrantPoint {
  id: number | string;
  vector: number[];
  payload?: {
    industry?: string;
    'candidate-email'?: string;
    'document-id'?: string;
    'candidate-name'?: string;
    is_active?: boolean;
    'candidate-id'?: string;
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
 
// Helper interface for schema-compliant search filters
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
  private defaultCollection: string = "resume";

  constructor(collection: string = "resume") {
    this.client = new QdrantClient({
      url: process.env.QDRANT_HOST || "https://f1e275e3-11eb-4c8d-ac0b-d1e7db4d5c0c.us-east4-0.gcp.cloud.qdrant.io",
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.defaultCollection = collection;
  }

  /**
   * Transform payload to match Qdrant schema requirements
   */
  async uploadResumeToQdrant(vectors : EmbeddingResult[], user: {
    id : string;
    email: string;
    name: string;
    resumeId : string;
    industry: string;
  }): Promise<any> {
    
    const transformedPayload : QdrantPoint[] = vectors.map((em)=>{
      return {
        id: randomUUID(),
        vector: em.embedding,
        payload: {
          industry: user.industry,
          'candidate-id': user.id,
          'candidate-email': user.email, 
          'candidate-name': user.name,
          'document-id': user.resumeId,
          is_active: true,
          section : em.section,
        }
      }
    })
    return await this.uploadPoints(transformedPayload, "resume") 
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

      return operationInfo;
    } catch (error) {
      logger.error('Error uploading points to Qdrant:', error);
      throw new Error("Failed to upload to Qdrant...");
    }
  }

  /**
   * Perform global search without filters
   */
  async globalSearch(query: number[], limit: number = 10, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      
      const searchResult = await this.client.query(targetCollection, {
        query,
        limit,
        with_payload: true,
      });

      logger.info(`Global search completed, found ${searchResult.points.length} results`);
      return searchResult.points;
    } catch (error) {
      logger.error('Error performing global search:', error);
      throw error;
    }
  }

  /**
   * Perform filtered search with specific criteria
   */
  async filteredSearch(embeddedSections : JobEmbeddingResult[], candidates : string[], k : number,  collection?: string): Promise<any> {
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
          });

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
  async deletePoints(ids: (number | string)[], collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      
      const deleteResult = await this.client.delete(targetCollection, {
        points: ids,
      });
      
      logger.info(`Successfully deleted ${ids.length} points from collection: ${targetCollection}`);
      return deleteResult;
    } catch (error) {
      logger.error('Error deleting points from Qdrant:', error);
      throw error;
    }
  }

  /**
   * Get point by ID
   */
  async getPointById(id: number | string, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      const point = await this.client.retrieve(targetCollection, {
        ids: [id],
        with_payload: true,
        with_vector: true,
      });
      return point;
    } catch (error) {
      logger.error(`Error retrieving point ${id}:`, error);
      throw error;
    }
  }


}


export const qdrantService = new QdrantService();

export default QdrantService;