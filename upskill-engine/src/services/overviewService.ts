import { ExtractedResume } from "@/types/resume.types";
import logger from "../config/logger";

class overviewService {
  private getBaseUrl(): string {
    // Prefer explicit AI/Resume server URL, fall back to common local defaults
    return (
      process.env.AI_SERVER_URL ||
      process.env.RESUME_SERVER_URL ||
      'http://localhost:5000'
    );
  }

  // Fetch resume JSON from the AI Server via GET /api/resume/:id
  async loadResumeFromResumeServer(resumeId: string): Promise<any> {
    if (!resumeId) throw new Error('resumeId is required');
    const base = this.getBaseUrl();
    const url = `${base.replace(/\/$/, '')}/api/resume/${encodeURIComponent(resumeId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('❌ [AI SERVER] Failed to fetch resume by id', {
        url,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
    }

    // Many APIs wrap the payload as { success, data }. Try to unwrap gracefully.
  const json: any = await response.json();
    // Try common shapes
    if (json?.data) return json.data;
    if (json?.resume) return json.resume;
    return json;
  }

  // Extract concise, comparable parts from an arbitrary resume payload
  extractKeyParts(resume: any): ExtractedResume {
    if (!resume || typeof resume !== 'object') return {};

    // Heuristic mapping to support different DTO shapes
    const name = resume.name || resume.fullName || resume.candidateName;
    const email = resume.email || resume.contactEmail || resume.contact?.email;
    const phone = resume.phone || resume.contactPhone || resume.contact?.phone;
    const summary = resume.summary || resume.profile || resume.objective;

    const skills: string[] =
      resume.skills?.map((s: any) => (typeof s === 'string' ? s : s?.name || s?.title))
        .filter(Boolean) ||
      resume.technicalSkills ||
      [];

    const experience =
      resume.experience ||
      resume.workExperience ||
      resume.jobs ||
      [];

    const education = resume.education || resume.educations || [];
    const certifications = resume.certifications || resume.certs || [];
    const projects = resume.projects || [];

    return {
      id: resume.id || resume._id,
      name,
      email,
      phone,
      summary,
      skills,
      experience,
      education,
      certifications,
      projects,
    };
  }

  // Build a compact context string for LLM comparison
  buildResumeContext(res: ExtractedResume): string {
    const parts: string[] = [];
    if (res.name) parts.push(`Name: ${res.name}`);
    if (res.email) parts.push(`Email: ${res.email}`);
    if (res.summary) parts.push(`Summary: ${res.summary}`);
    if (res.skills?.length) parts.push(`Skills: ${res.skills.slice(0, 30).join(', ')}`);
    if (res.experience?.length) {
      const expBrief = res.experience
        .slice(0, 5)
        .map((e) => `${e.role || ''} @ ${e.company || ''} (${e.duration || ''})`)
        .filter(Boolean)
        .join(' | ');
      if (expBrief) parts.push(`Experience: ${expBrief}`);
    }
    if (res.education?.length) {
      const eduBrief = res.education
        .slice(0, 3)
        .map((e) => `${e.degree || ''} - ${e.institution || ''} ${e.year ? `(${e.year})` : ''}`)
        .filter(Boolean)
        .join(' | ');
      if (eduBrief) parts.push(`Education: ${eduBrief}`);
    }
    return parts.join('\n');
  }
}

export const OverviewService = new overviewService();