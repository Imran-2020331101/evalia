const ResumeDTO = require("../dto/ResumeDTO");
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
      if (edu.gpa) parts.push("CGPA :" + edu.gpa);
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

// Utility function to aggregate search results by candidate
function aggregateResultsByCandidate(searchResults) {
  const candidateMap = {};

  // Initialize or update candidate scores
  searchResults.forEach((result) => {
    const email = result.candidateEmail;

    if (!candidateMap[email]) {
      candidateMap[email] = {
        id: result.candidateId || "default Id",
        name: result.candidateName || "name not found",
        email: email,
        skills: { score: 0, details: [] },
        experience: { score: 0, years: 0, companies: [] },
        projects: { score: 0, count: 0, projects: [] },
        education: { score: 0, degree: "", institution: "", gpa: 0 },
        totalScore: 0,
      };
    }

    // Add score to the appropriate section
    switch (result.section) {
      case "skills":
        candidateMap[email].skills.score += result.score;
        break;
      case "experience":
        candidateMap[email].experience.score += result.score;
        break;
      case "projects":
        candidateMap[email].projects.score += result.score;
        break;
      case "education":
        candidateMap[email].education.score += result.score;
        break;
    }
  });

  // Calculate total scores and convert to array
  const candidates = Object.values(candidateMap).map((candidate) => {
    candidate.totalScore =
      candidate.skills.score +
      candidate.experience.score +
      candidate.projects.score +
      candidate.education.score;

    // Round scores to 2 decimal places
    candidate.skills.score = Math.round(candidate.skills.score * 100) / 100;
    candidate.experience.score =
      Math.round(candidate.experience.score * 100) / 100;
    candidate.projects.score = Math.round(candidate.projects.score * 100) / 100;
    candidate.education.score =
      Math.round(candidate.education.score * 100) / 100;
    candidate.totalScore = Math.round(candidate.totalScore * 100) / 100;

    return candidate;
  });

  // Sort by total score in descending order
  return candidates.sort((a, b) => b.totalScore - a.totalScore);
}


function mapToResumeDTO(source) {
  return new ResumeDTO({
    filename: source.filename,
    originalName: source.originalName,
    fileLink: source.fileLink,
    industry: source.industry,
    skills: {
      technical: source.skills?.technical || [],
      soft: source.skills?.soft || [],
      languages: source.skills?.languages || [],
      tools: source.skills?.tools || [],
      other: source.skills?.other || [],
    },
    experience: source.experience?.map(exp => ({
      job_title: exp.job_title,
      company: exp.company,
      duration: exp.duration,
      description: exp.description || [],
      achievements: exp.achievements || [],
    })) || [],
    education: source.education?.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      gpa: edu.gpa,
    })) || [],
    projects: source.projects?.map(project => ({
      title: project.title,
      description: project.description,
      technologies: project.technologies || [],
      url: project.url || null,
    })) || [],
    contact: {
      email: source.contact?.email || "",
      phone: source.contact?.phone || "",
      linkedin: source.contact?.linkedin || "",
      github: source.contact?.github || "",
      location: source.contact?.location || "",
    },
    certifications: source.certifications?.map(cert => ({
      title: cert.title,
      provider: cert.provider,
      date: cert.date,
      link: cert.link,
    })) || [],
    awards: source.awards || [],
    volunteer: source.volunteer || [],
    interests: source.interests || [],
    status: source.status || "completed"
  });
}


module.exports = {
  skillsToString,
  experienceToString,
  educationToString,
  projectsToString,
  aggregateResultsByCandidate,
  mapToResumeDTO
};
