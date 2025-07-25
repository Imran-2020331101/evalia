const { Pinecone } = require("@pinecone-database/pinecone");
const logger = require("../utils/logger");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = "resume-bot"; // initialized once

// Helper function to convert skills object to string
function skillsToString(skills) {
  if (!skills) return "";

  const parts = [];
  if (skills.technical && skills.technical.length > 0) {
    parts.push(skills.technical.join(" "));
  }
  if (skills.soft && skills.soft.length > 0) {
    parts.push(skills.soft.join(" "));
  }
  if (skills.languages && skills.languages.length > 0) {
    parts.push(skills.languages.join(" "));
  }
  if (skills.tools && skills.tools.length > 0) {
    parts.push(skills.tools.join(" "));
  }
  if (skills.other && skills.other.length > 0) {
    parts.push(skills.other.join(" "));
  }

  return parts.join(" ");
}

// Helper function to convert education array to string
function educationToString(education) {
  if (!education || !Array.isArray(education)) return "";

  return education
    .map((edu) => {
      const parts = [];
      if (edu.degree) parts.push(edu.degree);
      if (edu.institution) parts.push(edu.institution);
      if (edu.year) parts.push(edu.year);
      if (edu.gpa) parts.push(edu.gpa);
      return parts.join(" ");
    })
    .join(" ");
}

// Helper function to convert projects array to string
function projectsToString(projects) {
  if (!projects || !Array.isArray(projects)) return "";

  return projects
    .map((project) => {
      const parts = [];
      if (project.title) parts.push(project.title);
      if (project.description) parts.push(project.description);
      if (project.technologies && project.technologies.length > 0) {
        parts.push(project.technologies.join(" "));
      }
      if (project.url) parts.push(project.url);
      return parts.join(" ");
    })
    .join(" ");
}

// Helper function to convert experience array to string
function experienceToString(experience) {
  if (!experience || !Array.isArray(experience)) return "";

  return experience
    .map((exp) => {
      const parts = [];
      if (exp.job_title) parts.push(exp.job_title);
      if (exp.company) parts.push(exp.company);
      if (exp.duration) parts.push(exp.duration);
      if (exp.description && exp.description.length > 0) {
        parts.push(exp.description.join(" "));
      }
      if (exp.achievements && exp.achievements.length > 0) {
        parts.push(exp.achievements.join(" "));
      }
      return parts.join(" ");
    })
    .join(" ");
}

async function addToVectordb(email, data) {
  // Convert structured data to strings
  const skillsText = skillsToString(data.skills);
  const educationText = educationToString(data.education);
  const projectsText = projectsToString(data.projects);
  const experienceText = experienceToString(data.experience);

  const records = [
    {
      id: email + "_skills",
      values: skillsText,
      metadata: {
        section: "skills",
        original_text: skillsText,
        candidate_email: email,
      },
    },
    {
      id: email + "_education",
      values: educationText,
      metadata: {
        section: "education",
        original_text: educationText,
        candidate_email: email,
      },
    },
    {
      id: email + "_projects",
      values: projectsText,
      metadata: {
        section: "projects",
        original_text: projectsText,
        candidate_email: email,
      },
    },
    {
      id: email + "_experience",
      values: experienceText,
      metadata: {
        section: "experience",
        original_text: experienceText,
        candidate_email: email,
      },
    },
  ];

  // Target the index
  const index = pc.index(indexName).namespace("example-namespace");

  // Upsert the records into a namespace
  const res = await index.upsert(records);

  logger.info("Vector DB Service :: Response from vector DB :: ", res);
  return res;
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
