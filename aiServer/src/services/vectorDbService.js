const { Pinecone } = require("@pinecone-database/pinecone");
const logger = require("../utils/logger");
const {
  skillsToString,
  educationToString,
  projectsToString,
  experienceToString,
} = require("../utils/resumeHelper");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = "resume-bot"; // initialized once

async function addToVectordb(email, data) {
  // Convert structured data to strings
  const skillsText = skillsToString(data.skills);
  const educationText = educationToString(data.education);
  const projectsText = projectsToString(data.projects);
  const experienceText = experienceToString(data.experience);

  const records = [
    {
      "_id": email + "_skills",
      "text": skillsText,
      "section": "skills",
      "candidate_email": email,
    },
    {
      "_id": email + "_education",
      "text": educationText,
      "section": "education",
      "candidate_email": email,

    },
    {
      "_id": email + "_projects",
      "text": projectsText,
      "section": "projects",
      "candidate_email": email,

    },
    {
      "_id": email + "_experience",
      "text": experienceText,
      "section": "experience",
      "candidate_email": email,
    },
  ];
  console.log(email);
  // Target the index
  const index = pc.index(indexName).namespace("resume");

  // Upsert the records into a namespace
  const res = await index.upsertRecords(records);

  console.log("Vector DB Service :: Response from vector DB :: ", res);
  return res || null;
}

async function searchVectordb(referenceCV, industry) {
  try {
    const index = pc.index(indexName).namespace(industry);

    // Search the index using Pinecone's built-in embedding
    const results = await index.query({
      data: referenceCV,
      topK: 10,
      includeMetadata: true,
    });

    logger.info("Vector search results:", results.matches.length);

    // Return the results with metadata
    return results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      section: match.metadata.section,
      candidateEmail: match.metadata.candidate_email,
      originalText: match.metadata.original_text,
    }));
  } catch (error) {
    logger.error("Error in searchVectordb:", error);
    return [];
  }
}

async function advancedSearch(referenceCV, industry, numOfResults = 10) {
  try {
    const index = pc.index(indexName).namespace(industry);

    // Search the index using Pinecone's built-in embedding
    const results = await index.query({
      data: referenceCV,
      topK: numOfResults,
      includeMetadata: true,
    });

    logger.info("Advanced search results:", results.matches.length);

    // Return more detailed results
    return results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      section: match.metadata.section,
      candidateEmail: match.metadata.candidate_email,
      originalText: match.metadata.original_text,
    }));
  } catch (error) {
    logger.error("Error in advancedSearch:", error);
    return [];
  }
}

async function weightedSearch(recruiterQuery, industry = "example-namespace") {
  try {
    const index = pc.index(indexName).namespace(industry);
    const resultChunks = [];

    // Search each section separately
    for (const section of ["skills", "experience", "education", "projects"]) {
      const results = await index.query({
        data: recruiterQuery,
        topK: 10,
        includeMetadata: true,
        filter: { section: { $eq: section } },
      });
      resultChunks.push(...results.matches);
    }

    // Aggregate by candidate_email
    const grouped = {};
    for (const hit of resultChunks) {
      const email = hit.metadata.candidate_email;
      if (!grouped[email]) {
        grouped[email] = { totalScore: 0, sections: {} };
      }
      grouped[email].totalScore += hit.score;
      grouped[email].sections[hit.metadata.section] = {
        score: hit.score,
        text: hit.metadata.original_text,
      };
    }

    // Top candidates
    const topCandidates = Object.entries(grouped)
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

module.exports = {
  addToVectordb,
  searchVectordb,
  advancedSearch,
  weightedSearch,
};
