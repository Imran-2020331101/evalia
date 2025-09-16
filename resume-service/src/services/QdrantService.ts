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

export interface ResumePoint {
    experience?: { vector: number[], payload: any },
    skills?: { vector: number[], payload: any },
    projects?: { vector: number[], payload: any },
    education?: { vector: number[], payload: any }
  } 

export interface SearchResult {
  section: string;
  result: {
    points: QdrantSearchPoint[];
  };
}

export interface QdrantSearchPoint {
  id: string | number;
  version: number;
  score: number;
  payload?: Record<string, unknown> | null | undefined;
  vector?: Record<string, unknown> | number[] | number[][] | null | undefined;
  shard_key?: string | number | Record<string, unknown> | null | undefined;
  order_value?: number | Record<string, unknown> | null | undefined;
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
      
      logger.info(`Uploading ${transformedPoints.length} points to collection: ${targetCollection}`, {
        candidateEmails: [...new Set(transformedPoints.map(p => p.payload?.['candidate-email']).filter(Boolean))],
        sections: [...new Set(transformedPoints.map(p => p.payload?.section).filter(Boolean))]
      });
      
      const operationInfo = await this.client.upsert(targetCollection, {
        wait: true, // ✅ Ensure operation completes before returning
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


  /**
   * Perform global search without filters
   */
  async globalSearch(embeddedSections : JobEmbeddingResult[], limit: number = 10, collection?: string): Promise<any> {

      const targetCollection = collection || this.defaultCollection;
      const searchResult : SearchResult[] = [];
      
      for( const sections of embeddedSections){
        
        const result = await this.client.query(targetCollection, {
          query: sections.embedding,
          limit: limit,      
          with_payload: true,      
          },
    
        );
        searchResult.push({
          section: sections.section,
          result,
        })
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
  async deletePointsByUserId( candidateId: string,  collection?: string): Promise<any> {
      try {
        const targetCollection = collection || this.defaultCollection || 'resume';
        
        // First check if points exist
        const existingPoints = await this.client.query(targetCollection, {
          query: Array(1536).fill(0), // Dummy vector for existence check
          "filter": {
          "must": [
            {
              "key": "candidate-id",
              "match": { "value": candidateId }
            }
          ]
        },
          limit: 1,
          with_payload: true,
        });
        
        if (existingPoints.points.length === 0) {
          logger.info(`No existing points found for candidate: ${candidateId}`);
          return { status: 'ok', operation_id: null };
        }
        
        const deleteResult = await this.client.delete(targetCollection, 
        {
          "filter": {
            "must": [
              {
                "key": "candidate-id",
                "match": { "value": candidateId }
              }
            ]
          }
        }
  
        );
        
        logger.info(`Delete operation completed for candidate ${candidateId}:`, {
          status: deleteResult.status,
          operation_id: deleteResult.operation_id
        });
        
        return deleteResult;
      } catch (error) {
        logger.error(`Error deleting points for candidate ${candidateId}:`, error);
        throw new Error(`Failed to delete vector entries for candidate: ${candidateId}`);
      }
  }

  /**
   * Get resume data organized by sections with vectors
   */
  async getPointByResumeId(candidateId: string, collection?: string): Promise< ResumePoint | null> {
    try {
      const targetCollection = collection || this.defaultCollection;
      const result = await this.client.scroll(targetCollection, {
        filter: {
          must: [{
              key: "candidate-id",
              match: {
                value: candidateId,
              },
            }],
        },
        limit: 4,
        with_payload: true,
        with_vector: true, 
      });
      
      if (result.points.length === 0) {
        logger.info(`No point found for resume id: ${candidateId}`);
        return null;
      }
      
      // convert to ResumePoint
      const resumeData: {
        experience?: { vector: number[], payload: any },
        skills?: { vector: number[], payload: any },
        projects?: { vector: number[], payload: any },
        education?: { vector: number[], payload: any }
      } = {};
      
      result.points.forEach(point => {
        const section = point.payload?.section as string;
        const vector = Array.isArray(point.vector) ? point.vector as number[] : [];
        
        if (section && ['experience', 'skills', 'projects', 'education'].includes(section)) {
          resumeData[section as keyof typeof resumeData] = {
            vector,
            payload: point.payload
          };
        }
      });
      
      logger.info(`Retrieved resume data for ${candidateId} with sections:`, Object.keys(resumeData));
      return resumeData;
    } catch (error) {
      logger.error(`Error retrieving point by resume id: ${candidateId}:`, error);
      throw error;
    }
  }


}


export const qdrantService = new QdrantService();

export default QdrantService;