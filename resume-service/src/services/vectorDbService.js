const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const {
  skillsToString,
  educationToString,
  projectsToString,
  experienceToString,
  aggregateResultsByCandidate,
} = require('../utils/resumeHelper');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = 'resume-bot';

async function addToVectordb(email, data, userId, userName) {
  // Convert structured data to strings
  const skillsText = skillsToString(data.skills);
  const educationText = educationToString(data.education);
  const projectsText = projectsToString(data.projects);
  const experienceText = experienceToString(data.experience);

  // Array of potential sections to add
  const potentialSections = [
    {
      text: skillsText,
      section: 'skills',
    },
    {
      text: educationText,
      section: 'education',
    },
    {
      text: projectsText,
      section: 'projects',
    },
    {
      text: experienceText,
      section: 'experience',
    },
  ];

  // Only add records for non-empty sections
  const records = [];

  potentialSections.forEach(({ text, section }) => {
    if (text && text.trim() !== '') {
      records.push({
        _id: email + '_' + section,
        text: text,
        section: section,
        candidate_email: email,
        candidate_id: userId,
        candidate_name: userName,
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

  // Upsert the records into a namespace
  const res = await index.upsertRecords(records);

  console.log('Vector DB Service :: Response from vector DB :: ', res);
  return res || null;
}

async function naturalLanguageSearch(requirements, topK) {
  const { industry, skills, experience, projects, education } = requirements;

  if (!industry) {
    logger.error('NO industry found for the job description');
    return [];
  }

  try {
    const index = pc.index(indexName).namespace(industry);
    const allResults = [];

    // Define sections to search with their corresponding query text
    const sectionsToSearch = [
      { section: 'skills', queryText: skills || '' },
      { section: 'experience', queryText: experience || '' },
      { section: 'projects', queryText: projects || '' },
      { section: 'education', queryText: education || '' },
    ];
    console.log(
      'natural Language Search function called',
      skills,
      experience,
      projects
    );

    // Search each section separately
    for (const { section, queryText } of sectionsToSearch) {
      if (queryText && queryText.trim() !== '') {
        logger.info(
          `Searching in ${section} section with query: ${queryText.substring(
            0,
            70
          )}...`
        );

        const response = await index.searchRecords({
          query: {
            topK: parseInt(topK, 10),
            inputs: { text: queryText },
            filter: { section: section },
          },
          fields: [
            'text',
            'section',
            'candidate_email',
            'candidate_name',
            'candidate_id',
          ],
        });

        console.log('Pinecone search response received');

        if (response && response.result && response.result.hits) {
          // Add section info to each result
          const sectionResults = response.result.hits.map((record) => {
            return {
              id: record._id,
              score: record._score || 0,
              section: section,
              candidateEmail: record.fields?.candidate_email,
              candidateName: record.fields?.candidate_name,
              candidateId: record.fields?.candidate_id,
              originalText: record.fields?.text,
              querySection: section,
            };
          });

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
    logger.error('Error in naturalLanguageSearch:', error);
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

    logger.info('Advanced search results:', results.matches.length);

    // Return more detailed results
    return results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      section: match.metadata.section,
      candidateEmail: match.metadata.candidate_email,
      originalText: match.metadata.original_text,
    }));
  } catch (error) {
    logger.error('Error in advancedSearch:', error);
    return [];
  }
}

async function weightedSearch(recruiterQuery, industry = 'example-namespace') {
  try {
    const index = pc.index(indexName).namespace(industry);
    const resultChunks = [];

    // Search each section separately
    for (const section of ['skills', 'experience', 'education', 'projects']) {
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
    logger.error('Error in weightedSearch:', error);
    return [];
  }
}

module.exports = {
  addToVectordb,
  naturalLanguageSearch,
  advancedSearch,
  weightedSearch,
};
