export interface domainType{
  type:string,
  category:string,
  description:string,
}

export interface interviewQAStateType{
  question:string,
  referenceAnswer?:string
}
export enum JobType {
  PART_TIME = "PART_TIME",
  INTERN = "INTERN",
  FULL_TIME = "FULL_TIME",
  CONTRACT = "CONTRACT"
}

export enum WorkPlaceType {
  HYBRID = "HYBRID",
  ONSITE = "ONSITE",
  REMOTE = "REMOTE",
}

export enum EmploymentLevelType {
  ENTRY = "ENTRY",
  MID = "MID",
  SENIOR = "SENIOR",
}


export interface basicStateType{
  title:string,
  jobDescription:string,
  jobLocation:string,
  salaryFrom:string,
  salaryTo:string,
  deadline:string,
  jobType:JobType,
  isOpenJobType:boolean,
  workPlaceType:WorkPlaceType,
  isOpenWorkPlaceType:boolean,
  employmentLevelType: EmploymentLevelType,
  isOpenEmploymentLevelType:boolean
}


export interface jobType {
    companyInfo: {
        id: string;
    };
    basic: {
        title: string;
        jobDescription: string;
        jobLocation: string;
        salaryFrom: string;
        salaryTo: string;
        deadline: string;
        jobType: string;
        workPlaceType: string;
        employmentLevelType: string;
    };
    requirement: domainType[];
    responsibility: domainType[];
    skill: domainType[];
    interviewQA: interviewQAStateType[];
}
