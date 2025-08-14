export interface domainType{
  type:string,
  category:string,
  description:string,
}

export interface interviewQAStateType{
  question:string,
  referenceAnswer:string
}
export interface basicStateType{
  title:string,
  jobDescription:string,
  jobLocation:string,
  salaryFrom:string,
  salaryTo:string,
  deadline:string,
  jobType:string,
  isOpenJobType:boolean,
  workPlaceType:string,
  isOpenWorkPlaceType:boolean,
  employmentLevelType:string,
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
