import { describe, it, expect } from 'vitest';
import {
  skillsToString, educationToString, projectsToString, experienceToString,
  aggregateResultsByCandidate, mapToResumeDTO,
} from '../../../src/utils/resumeHelper';
import { ResumeDTO } from '../../../src/types/resume.types';

describe('skillsToString', () => {
  it('returns empty string for undefined', () => expect(skillsToString(undefined)).toBe(''));
  it('returns empty string for empty skill lists', () => {
    expect(skillsToString({ technical: [], soft: [], languages: [], tools: [], other: [] })).toBe('');
    expect(skillsToString({} as any)).toBe('');
  });
  it('joins every category in order', () => {
    expect(skillsToString({
      technical: ['ts', 'go'], soft: ['teamwork'], languages: ['en'], tools: ['git'], other: ['yoga'],
    })).toBe('ts go teamwork en git yoga');
  });
  it('skips empty categories', () => {
    expect(skillsToString({ technical: ['a'], soft: [], languages: [], tools: ['b'], other: [] })).toBe('a b');
  });
});

describe('educationToString', () => {
  it('handles undefined / non-array', () => {
    expect(educationToString(undefined)).toBe('');
    expect(educationToString('x' as any)).toBe('');
  });
  it('formats degree, institution and gpa', () => {
    expect(educationToString([
      { degree: 'BSc', institution: 'MIT', year: '2020', gpa: '3.9' },
      { degree: 'MSc', institution: '', year: '', gpa: '' },
      { degree: '', institution: 'Oxford', year: '', gpa: '' },
    ])).toBe('BSc MIT CGPA :3.9 MSc Oxford');
  });
});

describe('projectsToString', () => {
  it('handles undefined / non-array', () => {
    expect(projectsToString(undefined)).toBe('');
    expect(projectsToString({} as any)).toBe('');
  });
  it('formats title, description and technologies', () => {
    expect(projectsToString([
      { title: 'A', description: 'desc', technologies: ['x', 'y'], url: '' },
      { title: '', description: '', technologies: [], url: '' },
      { title: 'B', description: '', technologies: [], url: '' },
    ])).toBe('A desc x y  B');
  });
});

describe('experienceToString', () => {
  it('handles undefined / non-array', () => {
    expect(experienceToString(undefined)).toBe('');
    expect(experienceToString(null as any)).toBe('');
  });
  it('formats all parts', () => {
    expect(experienceToString([
      { job_title: 'Dev', company: 'ACME', duration: '2y', description: ['built', 'shipped'], achievements: ['won'] },
      { job_title: '', company: '', duration: '', description: [], achievements: [] },
      { job_title: 'QA', company: '', duration: '', description: [], achievements: [] },
    ])).toBe('Dev ACME 2y built shipped won  QA');
  });
});

describe('aggregateResultsByCandidate', () => {
  it('returns [] for no results', () => expect(aggregateResultsByCandidate([])).toEqual([]));

  it('aggregates per candidate, rounds, and sorts desc by total', () => {
    const out = aggregateResultsByCandidate([
      { candidateEmail: 'a@x.com', candidateId: '1', candidateName: 'A', section: 'skills', score: 0.111 },
      { candidateEmail: 'a@x.com', section: 'experience', score: 0.222 },
      { candidateEmail: 'a@x.com', section: 'projects', score: 0.333 },
      { candidateEmail: 'a@x.com', section: 'education', score: 0.444 },
      { candidateEmail: 'b@x.com', section: 'skills', score: 5 },
    ]);
    expect(out.map((c) => c.email)).toEqual(['b@x.com', 'a@x.com']);
    const a = out[1];
    expect(a.id).toBe('1');
    expect(a.name).toBe('A');
    expect(a.skills.score).toBe(0.11);
    expect(a.experience.score).toBe(0.22);
    expect(a.projects.score).toBe(0.33);
    expect(a.education.score).toBe(0.44);
    expect(a.totalScore).toBe(1.11);
    const b = out[0];
    expect(b.id).toBe('default Id');
    expect(b.name).toBe('name not found');
    expect(b.totalScore).toBe(5);
  });

  it('ignores unknown sections but still creates the candidate', () => {
    const out = aggregateResultsByCandidate([{ candidateEmail: 'z@x.com', section: 'other' as any, score: 9 }]);
    expect(out[0].totalScore).toBe(0);
  });
});

describe('mapToResumeDTO', () => {
  it('fills defaults for an empty source', () => {
    const dto = mapToResumeDTO({});
    expect(dto).toBeInstanceOf(ResumeDTO);
    expect(dto.industry).toBe('Others');
    expect(dto.status).toBe('completed');
    expect(dto.skills).toEqual({ technical: [], soft: [], languages: [], tools: [], other: [] });
    expect(dto.experience).toEqual([]);
    expect(dto.awards).toEqual([]);
  });

  it('maps a full source', () => {
    const dto = mapToResumeDTO({
      filename: 'r.pdf', fileLink: 'http://x/r.pdf', industry: 'STEM & Technical',
      skills: { technical: ['ts'], soft: [], languages: [], tools: [], other: [] },
      experience: [{ job_title: 'Dev', company: 'A', duration: '1y', description: ['d'], achievements: ['a'] },
        {} as any],
      education: [{ degree: 'BSc', institution: 'MIT', year: '2020', gpa: 4 as any }, {} as any],
      projects: [{ title: 'P', description: 'd', technologies: ['t'], url: 'u' }, {} as any],
      certifications: [{ title: 'C', provider: 'p', date: 'd', link: 'l' }, {} as any],
      awards: ['Best', { title: 'T', organization: 'O', year: '2020', description: 'D' } as any],
      volunteer: ['v'], interests: ['i'], status: 'processing',
      contact: { email: 'a@b.co', phone: '1', linkedin: 'l', github: 'g', location: 'x' },
    });
    expect(dto.filename).toBe('r.pdf');
    expect(dto.industry).toBe('STEM & Technical');
    // BUG: ResumeDTO ignores data.status and always sets 'completed'.
    expect(dto.status).toBe('completed');
    expect(dto.education[0].gpa).toBe('4');
    expect(dto.education[1]).toEqual({ degree: '', institution: '', year: '', gpa: '' });
    expect(dto.experience[1]).toEqual({ job_title: '', company: '', duration: '', description: [], achievements: [] });
    expect(dto.projects[1].url).toBe('');
    expect(dto.certifications[1].link).toBe('');
    expect(dto.awards[0]).toEqual({ title: 'Best', organization: '', year: '', description: '' });
    expect(dto.awards[1].title).toBe('T');
    expect(dto.volunteer).toEqual(['v']);
  });

  it('BUG: contact info is dropped because ResumeDTO reads data.email instead of data.contact.email', () => {
    const dto = mapToResumeDTO({ contact: { email: 'a@b.co', phone: '123' } });
    // Intended: 'a@b.co'. Actual: ''.
    expect(dto.contact.email).toBe('');
    expect(dto.contact.phone).toBe('');
  });
});
