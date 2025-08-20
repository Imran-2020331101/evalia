import { ObjectId } from "mongoose";

export type ResumeDTO = {
  filename: string;
  originalName: string;
  fileLink: string;
  industry: string;

  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
    other: string[];
  };

  experience: any[];   // you can replace `any` with a structured type
  education: any[];
  projects: any[];

  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
  };

  certifications: any[];
  awards: any[];
  volunteer: any[];
  interests: any[];

  status: "completed" | "pending" | string; // narrowed to union if you know possible states
};
