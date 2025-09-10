import { Pinecone } from "@pinecone-database/pinecone";
import logger from "../utils/logger";
const {
  skillsToString,
  educationToString,
  projectsToString,
  experienceToString,
  aggregateResultsByCandidate,
} = require("../utils/resumeHelper");

// Type definitions
interface VectorRecord {
  id: string;
  values?: number[];
  metadata: {
    text: string;
    section: string;
    candidate_email: string;
    candidate_id: string;
    candidate_name: string;
  };
}

interface ResumeData {
  skills: any;
  education: any[];
  projects: any[];
  experience: any[];
  industry: string;
}

interface SearchRequirements {
  industry?: string;
  skills?: string;
  experience?: string;
  projects?: string;
  education?: string;
}

interface SearchResult {
  id: string;
  score: number;
  section: string;
  candidateEmail: string;
  candidateName: string;
  candidateId: string;
  originalText: string;
  querySection: string;
}

interface AdvancedSearchResult {
  id: string;
  score: number;
  section: string;
  candidateEmail: string;
  originalText: string;
}

interface WeightedSearchResult {
  candidateEmail: string;
  totalScore: number;
  sections: {
    [section: string]: {
      score: number;
      text: string;
    };
  };
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const indexName = "resume-bot";

/**
 * Add resume data to vector database
 * @param email - Candidate email
 * @param data - Resume data
 * @param userId - User ID
 * @param userName - User name
 * @returns Promise with upsert response or null
 */
async function addToVectordb(
  email: string,
  data: ResumeData,
  userId: string,
  userName: string
): Promise<any> {
  // Convert structured data to strings
  const skillsText = skillsToString(data.skills);
  const educationText = educationToString(data.education);
  const projectsText = projectsToString(data.projects);
  const experienceText = experienceToString(data.experience);

  // Array of potential sections to add
  const potentialSections = [
    {
      text: skillsText,
      section: "skills",
    },
    {
      text: educationText,
      section: "education",
    },
    {
      text: projectsText,
      section: "projects",
    },
    {
      text: experienceText,
      section: "experience",
    },
  ];

  // Only add records for non-empty sections
  const records: VectorRecord[] = [];

  potentialSections.forEach(({ text, section }) => {
    if (text && text.trim() !== "") {
      records.push({
        id: email + "_" + section,
        metadata: {
          text: text,
          section: section,
          candidate_email: email,
          candidate_id: userId,
          candidate_name: userName,
        },
      });
    }
  });

  // Only proceed if we have at least one record
  if (records.length === 0) {
    logger.warn(`No valid sections found for candidate ${email}`);
    return null;
  }

  console.log(`Adding ${records.length} records for ${email}`);

  // Target the index
  const index = pc.index(indexName).namespace(data.industry);

  // Upsert the records into a namespace - using any type to handle Pinecone API compatibility
  const res = await (index as any).upsertRecords(records);

  console.log("Vector DB Service :: Response from vector DB :: ", res);
  return res;
}

/**
 * Perform natural language search across resume sections
 * @param requirements - Search requirements with industry and section queries
 * @param topK - Number of top results to return
 * @returns Promise<any[]> - Aggregated search results
 */
async function naturalLanguageSearch(
  requirements: SearchRequirements,
  topK: number
): Promise<any[]> {
  const { industry, skills, experience, projects, education } = requirements;

  if (!industry) {
    logger.error("NO industry found for the job description");
    return [];
  }

  try {
    const index = pc.index(indexName).namespace(industry);
    const allResults: SearchResult[] = [];

    // Define sections to search with their corresponding query text
    const sectionsToSearch = [
      { section: "skills", queryText: skills || "" },
      { section: "experience", queryText: experience || "" },
      { section: "projects", queryText: projects || "" },
      { section: "education", queryText: education || "" },
    ];

    console.log(
      "natural Language Search function called",
      skills,
      experience,
      projects
    );

    // Search each section separately
    for (const { section, queryText } of sectionsToSearch) {
      if (queryText && queryText.trim() !== "") {
        logger.info(
          `Searching in ${section} section with query: ${queryText.substring(
            0,
            70
          )}...`
        );

        const response = await (index as any).searchRecords({
          query: {
            topK: topK,
            inputs: { text: queryText },
            filter: { section: section },
          },
          fields: [
            "text",
            "section",
            "candidate_email",
            "candidate_name",
            "candidate_id",
          ],
        });

        console.log("Pinecone search response received");

        if (response && response.result && response.result.hits) {
          // Add section info to each result
          const sectionResults: SearchResult[] = response.result.hits.map(
            (record: any) => {
              return {
                id: record._id,
                score: record._score || 0,
                section: section,
                candidateEmail: record.fields?.candidate_email || "",
                candidateName: record.fields?.candidate_name || "",
                candidateId: record.fields?.candidate_id || "",
                originalText: record.fields?.text || "",
                querySection: section,
              };
            }
          );

          allResults.push(...sectionResults);
        }
      }
    }

    logger.info(
      `Vector search completed. Found ${allResults.length} total matches across all sections`
    );

    // Aggregate results by candidate
    const aggregatedCandidates = aggregateResultsByCandidate(allResults);

    logger.info(
      `Aggregated into ${aggregatedCandidates.length} unique candidates`
    );

    return aggregatedCandidates.length > 0 ? aggregatedCandidates : [];
  } catch (error) {
    logger.error("Error in naturalLanguageSearch:", error);
    return [];
  }
}

/**
 * Perform advanced search using reference CV
 * @param referenceCV - Reference CV data
 * @param industry - Target industry
 * @param numOfResults - Number of results to return
 * @returns Promise<AdvancedSearchResult[]> - Search results
 */
async function advancedSearch(
  referenceCV: any,
  industry: string,
  numOfResults: number = 10
): Promise<AdvancedSearchResult[]> {
  try {
    const index = pc.index(indexName).namespace(industry);

    // Search the index using Pinecone's built-in embedding - using any to handle API compatibility
    const results = await (index as any).query({
      vector: referenceCV,
      topK: numOfResults,
      includeMetadata: true,
    });

    logger.info("Advanced search results:", results.matches?.length || 0);

    // Return more detailed results
    return (results.matches || []).map((match: any) => ({
      id: match.id,
      score: match.score,
      section: match.metadata?.section || "",
      candidateEmail: match.metadata?.candidate_email || "",
      originalText: match.metadata?.original_text || "",
    }));
  } catch (error) {
    logger.error("Error in advancedSearch:", error);
    return [];
  }
}

/**
 * Perform weighted search across all sections
 * @param recruiterQuery - Recruiter query data
 * @param industry - Target industry namespace
 * @returns Promise<WeightedSearchResult[]> - Weighted search results
 */
async function weightedSearch(
  recruiterQuery: any,
  industry: string = "example-namespace"
): Promise<WeightedSearchResult[]> {
  try {
    const index = pc.index(indexName).namespace(industry);
    const resultChunks: any[] = [];

    // Search each section separately
    for (const section of ["skills", "experience", "education", "projects"]) {
      const results = await (index as any).query({
        vector: recruiterQuery,
        topK: 10,
        includeMetadata: true,
        filter: { section: { $eq: section } },
      });
      
      resultChunks.push(...(results.matches || []));
    }

    // Aggregate by candidate_email
    const grouped: {
      [email: string]: {
        totalScore: number;
        sections: { [section: string]: { score: number; text: string } };
      };
    } = {};

    for (const hit of resultChunks) {
      const email = hit.metadata?.candidate_email;
      if (!email) continue;
      
      if (!grouped[email]) {
        grouped[email] = { totalScore: 0, sections: {} };
      }
      grouped[email].totalScore += hit.score;
      grouped[email].sections[hit.metadata.section] = {
        score: hit.score,
        text: hit.metadata.original_text || "",
      };
    }

    // Top candidates
    const topCandidates: WeightedSearchResult[] = Object.entries(grouped)
      .sort((a, b) => b[1].totalScore - a[1].totalScore)
      .slice(0, 10)
      .map(([email, data]) => ({
        candidateEmail: email,
        totalScore: data.totalScore,
        sections: data.sections,
      }));

    return topCandidates;
  } catch (error) {
    logger.error("Error in weightedSearch:", error);
    return [];
  }
}

export {
  addToVectordb,
  naturalLanguageSearch,
  advancedSearch,
  weightedSearch,
};