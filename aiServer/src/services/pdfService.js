const pdfParse = require("pdf-parse");
const logger = require("../utils/logger");

class PDFService {
  /**
   * Extract text from PDF buffer
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async extractText(pdfBuffer) {
    try {
      logger.info("Starting PDF text extraction");

      const result = await pdfParse(pdfBuffer);

      logger.info("PDF text extraction completed", {
        pages: result.numpages,
        textLength: result.text.length,
      });

      return {
        text: result.text,
        metadata: {
          pages: result.numpages,
          info: result.info,
          version: result.version,
        },
      };
    } catch (error) {
      logger.error("PDF text extraction failed:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  /**
   * Analyze resume content and extract key information
   * @param {string} text - Extracted text from resume
   * @returns {Object} - Analyzed resume data
   */
  analyzeResume(text) {
    try {
      logger.info("Starting resume analysis");

      // Basic analysis - can be enhanced with AI/ML
      const analysis = {
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          text
        ),
        hasPhone:
          /(\+?\d{1,4}[-.\s]?)?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(
            text
          ),
        sections: this._identifySections(text),
        keywords: this._extractKeywords(text),
      };

      logger.info("Resume analysis completed", {
        wordCount: analysis.wordCount,
        sectionsFound: analysis.sections.length,
      });

      return analysis;
    } catch (error) {
      logger.error("Resume analysis failed:", error);
      throw new Error("Failed to analyze resume content");
    }
  }

  /**
   * Identify common resume sections
   * @private
   */
  _identifySections(text) {
    const sections = [];
    const sectionPatterns = {
      education: /education|academic|degree|university|college|school/i,
      experience: /experience|employment|work|career|professional/i,
      skills: /skills|competencies|abilities|proficiencies/i,
      projects: /projects|portfolio|work samples/i,
      certifications: /certifications|certificates|licenses/i,
      contact: /contact|phone|email|address|linkedin/i,
    };

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(text)) {
        sections.push(section);
      }
    }

    return sections;
  }

  /**
   * Extract potential keywords from resume
   * @private
   */
  _extractKeywords(text) {
    // Basic keyword extraction - can be enhanced with NLP
    const techKeywords = [
      "javascript",
      "python",
      "java",
      "react",
      "node.js",
      "angular",
      "vue",
      "mongodb",
      "sql",
      "postgresql",
      "mysql",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "git",
      "linux",
      "typescript",
      "html",
      "css",
    ];

    const foundKeywords = techKeywords.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    return foundKeywords;
  }
}

module.exports = new PDFService();
