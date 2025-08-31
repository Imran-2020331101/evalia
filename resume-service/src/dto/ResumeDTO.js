class ResumeDTO {
  constructor(data = {}) {
    this.filename = data.filename || "";
    this.originalName = data.originalName || "";
    this.fileLink = data.fileLink || "";
    this.industry = data.industry || "";
    this.skills = data.skills || {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
      other: [],
    };
    this.experience = data.experience || [];
    this.education = data.education || [];
    this.projects = data.projects || [];
    this.contact = data.contact || {
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      location: "",
    };
    this.certifications = data.certifications || [];
    this.awards = data.awards || [];
    this.volunteer = data.volunteer || [];
    this.interests = data.interests || [];
    this.status = data.status || "completed";
  }

  // Method to validate required fields for display
  validate() {
    const errors = [];

    if (!this.filename) errors.push("filename is required");
    // originalName is now optional - removed the required validation

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Method to convert to plain object for frontend
  toObject() {
    return {
      filename: this.filename,
      originalName: this.originalName,
      fileLink: this.fileLink,
      industry: this.industry,
      skills: this.skills,
      experience: this.experience,
      education: this.education,
      projects: this.projects,
      contact: this.contact,
      certifications: this.certifications,
      awards: this.awards,
      volunteer: this.volunteer,
      interests: this.interests,
      status: this.status,
    };
  }

  // Static method to create from database object
  static fromObject(obj) {
    return new ResumeDTO(obj);
  }
}

module.exports = ResumeDTO;
