import { QdrantClient } from "@qdrant/js-client-rest";
import logger from '../utils/logger';
import { EmbeddingResult } from "./OpenAIService";
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

export interface QdrantSearchFilter {
  must?: Array<{
    key: string;
    match: { value: any };
  }>;
  should?: Array<{
    key: string;
    match: { value: any };
  }>;
  must_not?: Array<{
    key: string;
    match: { value: any };
  }>;
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

export interface QdrantSearchOptions {
  query: number[];
  filter?: QdrantSearchFilter;
  with_payload?: boolean;
  with_vector?: boolean;
  limit?: number;
  offset?: number;
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
  async filteredSearch(options: QdrantSearchOptions, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      
      const searchOptions = {
        query: options.query,
        filter: options.filter,
        with_payload: options.with_payload ?? true,
        with_vector: options.with_vector ?? false,
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
      };

      const searchResult = await this.client.query(targetCollection, searchOptions);
      
      logger.info(`Filtered search completed, found ${searchResult.points.length} results`);
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
   * Delete points by filter
   */
  async deleteByFilter(filter: QdrantSearchFilter, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      
      const deleteResult = await this.client.delete(targetCollection, {
        filter,
      });
      
      logger.info(`Successfully deleted points matching filter from collection: ${targetCollection}`);
      return deleteResult;
    } catch (error) {
      logger.error('Error deleting points by filter:', error);
      throw error;
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(
    collectionName: string, 
    vectorSize: number, 
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
  ): Promise<any> {
    try {
      const createResult = await this.client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: distance,
        },
      });
      
      logger.info(`Successfully created collection: ${collectionName}`);
      return createResult;
    } catch (error) {
      logger.error(`Error creating collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      const info = await this.client.getCollection(targetCollection);
      return info;
    } catch (error) {
      logger.error(`Error getting collection info for ${collection}:`, error);
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

  /**
   * Helper method to create schema-compliant search filters
   */
  createSchemaFilter(filters: QdrantSchemaFilter): QdrantSearchFilter {
    const must: Array<{ key: string; match: { value: any } }> = [];

    if (filters.industry) {
      must.push({ key: 'industry', match: { value: filters.industry.toLowerCase() } });
    }

    if (filters['candidate-email']) {
      must.push({ key: 'candidate-email', match: { value: filters['candidate-email'] } });
    }

    if (filters['candidate-id']) {
      must.push({ key: 'candidate-id', match: { value: filters['candidate-id'] } });
    }

    if (filters['candidate-name']) {
      must.push({ key: 'candidate-name', match: { value: filters['candidate-name'] } });
    }

    if (filters['document-id']) {
      must.push({ key: 'document-id', match: { value: filters['document-id'] } });
    }

    if (filters.is_active !== undefined) {
      must.push({ key: 'is_active', match: { value: filters.is_active } });
    }

    return { must };
  }

  /**
   * Search for active candidates by industry
   */
  async searchActiveCandidatesByIndustry(
    query: number[], 
    industry: string, 
    limit: number = 10,
    collection?: string
  ): Promise<any> {
    const filter = this.createSchemaFilter({
      industry: industry,
      is_active: true
    });

    return this.filteredSearch({
      query,
      filter,
      limit,
      with_payload: true
    }, collection);
  }

  /**
   * Search for specific candidate's documents
   */
  async searchCandidateDocuments(
    candidateEmail: string,
    collection?: string
  ): Promise<any> {
    const filter = this.createSchemaFilter({
      'candidate-email': candidateEmail,
      is_active: true
    });

    return this.filteredSearch({
      query: [], // Empty query for filter-only search
      filter,
      limit: 100,
      with_payload: true
    }, collection);
  }

  /**
   * Deactivate candidate documents (soft delete)
   */
  async deactivateCandidateDocuments(candidateEmail: string, collection?: string): Promise<any> {
    try {
      const targetCollection = collection || this.defaultCollection;
      
      // First, find all documents for this candidate
      const candidateDocuments = await this.searchCandidateDocuments(candidateEmail, collection);
      
      if (candidateDocuments.length === 0) {
        logger.warn(`No documents found for candidate: ${candidateEmail}`);
        return { deactivated: 0 };
      }

      // Update each document to set is_active = false
      const updatePromises = candidateDocuments.map((doc: any) => 
        this.client.setPayload(targetCollection, {
          points: [doc.id],
          payload: {
            ...doc.payload,
            is_active: false
          }
        })
      );

      await Promise.all(updatePromises);
      
      logger.info(`Deactivated ${candidateDocuments.length} documents for candidate: ${candidateEmail}`);
      return { deactivated: candidateDocuments.length };
    } catch (error) {
      logger.error(`Error deactivating documents for candidate ${candidateEmail}:`, error);
      throw error;
    }
  }

  /**
   * Update collection alias
   */
  async updateCollectionAlias(collectionName: string, aliasName: string): Promise<any> {
    try {
      const result = await this.client.updateCollectionAliases({
        actions: [
          {
            create_alias: {
              collection_name: collectionName,
              alias_name: aliasName,
            },
          },
        ],
      });
      
      logger.info(`Successfully updated alias ${aliasName} for collection: ${collectionName}`);
      return result;
    } catch (error) {
      logger.error(`Error updating collection alias:`, error);
      throw error;
    }
  }
}


export const qdrantService = new QdrantService();

export default QdrantService;