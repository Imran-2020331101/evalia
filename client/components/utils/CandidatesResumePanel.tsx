import { Briefcase, GraduationCap, Award, Code, Link as LinkIcon } from "lucide-react";

export const dummyCandidateData = {
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "REST APIs"],
    soft: ["Problem-Solving", "Team Leadership", "Time Management", "Communication"],
    languages: ["English", "Spanish", "German"],
    tools: ["Git", "Docker", "Jest", "Figma"],
    other: ["Agile Methodologies", "SCRUM"],
  },
  experience: [
    {
      job_title: "Senior Frontend Developer",
      company: "TechNova Solutions",
      duration: "Jan 2021 – Present",
      description: [
        "Led the migration of a legacy Angular app to Next.js.",
        "Collaborated with backend team to design RESTful APIs.",
        "Implemented reusable component library in TypeScript."
      ],
      achievements: [
        "Improved page load speed by 45%",
        "Mentored 4 junior developers"
      ]
    },
    {
      job_title: "Frontend Developer",
      company: "WebCraft Agency",
      duration: "Jun 2018 – Dec 2020",
      description: [
        "Built custom WordPress themes and React applications.",
        "Worked closely with designers to translate UI/UX wireframes into responsive web apps."
      ],
      achievements: [
        "Completed 30+ client projects on time",
        "Increased client retention by 20%"
      ]
    }
  ],
  education: [
    {
      degree: "B.Sc. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2018",
      gpa: "3.9"
    }
  ],
  projects: [
    {
      title: "AI Resume Analyzer",
      description: "A web app that uses NLP to analyze resumes and suggest improvements.",
      technologies: ["Next.js", "Node.js", "OpenAI API"],
      url: "https://github.com/example/ai-resume-analyzer"
    },
    {
      title: "E-commerce Platform",
      description: "Built a scalable e-commerce solution with custom CMS.",
      technologies: ["React", "Redux", "Express", "MongoDB"]
    }
  ],
  certifications: [
    {
      title: "AWS Certified Solutions Architect – Associate",
      provider: "Amazon Web Services",
      date: "2023",
      link: "https://aws.amazon.com/certification/"
    },
    {
      title: "Scrum Master Certified (SMC)",
      provider: "Scrum Alliance",
      date: "2022",
      link: "https://www.scrumalliance.org/"
    }
  ],
  awards: [
    {
      title: "Employee of the Year",
      organization: "TechNova Solutions",
      year: "2022",
      description: "Recognized for outstanding project delivery and leadership."
    },
    {
      title: "Innovation Award",
      organization: "WebCraft Agency",
      year: "2019",
      description: "Awarded for creating a proprietary page builder tool."
    }
  ]
};


type CandidateProfileProps = {
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    tools?: string[];
    other?: string[];
  };
  experience?: Array<{
    job_title: string;
    company: string;
    duration: string;
    description?: string[];
    achievements?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    title: string;
    provider: string;
    date: string;
    link?: string;
  }>;
  awards?: Array<{
    title: string;
    organization: string;
    year: string;
    description?: string;
  }>;
};

interface propType{
  isScroll:boolean
}

const CandidatesResumePanel = ({isScroll}:propType) => {
    const {skills,experience,education,projects,certifications,awards}=dummyCandidateData
  return (
    <div className={`w-full min-h-full ${isScroll?'overflow-y-auto  ':''} scroll-container pl-[7%] bg-slate-900 text-gray-100 p-6 space-y-8`}>
      
      {/* Skills */}
      {skills && Object.values(skills).some(arr => arr && arr.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Code size={18} /> Skills
          </h2>
          <div className="space-y-3">
            {skills.technical?.length ? (
              <div>
                <p className="font-medium text-gray-300">Technical</p>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.soft?.length ? (
              <div>
                <p className="font-medium text-gray-300">Soft Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.soft.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.languages?.length ? (
              <div>
                <p className="font-medium text-gray-300">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{lang}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.tools?.length ? (
              <div>
                <p className="font-medium text-gray-300">Tools & Frameworks</p>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.other?.length ? (
              <div>
                <p className="font-medium text-gray-300">Other</p>
                <div className="flex flex-wrap gap-2">
                  {skills.other.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Briefcase size={18} /> Experience
          </h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-medium text-white">{exp.job_title}</p>
              <p className="text-sm text-blue-400">{exp.company}</p>
              <p className="text-xs text-gray-400">{exp.duration}</p>
              {exp.description?.length ? (
                <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                  {exp.description.map((desc, i) => <li key={i}>{desc}</li>)}
                </ul>
              ) : null}
              {exp.achievements?.length ? (
                <ul className="list-disc list-inside text-sm text-green-400 mt-1 space-y-1">
                  {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {/* Education */}
      {education?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <GraduationCap size={18} /> Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{edu.degree}</p>
              <p className="text-sm text-green-400">{edu.institution}</p>
              <p className="text-xs text-gray-400">{edu.year} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </section>
      ) : null}

      {/* Projects */}
      {projects?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Code size={18} /> Projects
          </h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{proj.title}</p>
              <p className="text-sm text-gray-300">{proj.description}</p>
              {proj.technologies?.length ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{tech}</span>
                  ))}
                </div>
              ) : null}
              {proj.url && (
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 flex items-center gap-1 mt-1 hover:underline">
                  <LinkIcon size={12} /> View Project
                </a>
              )}
            </div>
          ))}
        </section>
      ) : null}

      {/* Certifications */}
      {certifications?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Certifications
          </h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{cert.title}</p>
              <p className="text-sm text-gray-300">{cert.provider} • {cert.date}</p>
              {cert.link && (
                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                  {cert.link}
                </a>
              )}
            </div>
          ))}
        </section>
      ) : null}

      {/* Awards */}
      {awards?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Awards & Honors
          </h2>
          {awards.map((awd, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{awd.title}</p>
              <p className="text-sm text-gray-300">{awd.organization} • {awd.year}</p>
              {awd.description && <p className="text-xs text-gray-400">{awd.description}</p>}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}


export default CandidatesResumePanel;