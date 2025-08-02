'use client'

import Image from "next/image"
import { Didact_Gothic, Major_Mono_Display } from "next/font/google"
import { useEffect, useState } from "react"

import rightLogo from '../../../public/go-right.svg'
import leftLogo from '../../../public/go-left.svg'
import saveLogo from '../../../public/book-mark.svg'
import applyLogo from '../../../public/paper-plane.svg'
import exitLogo from '../../../public/x-solid.svg'
import evaliaLogo from '../../../public/evalia-short.png'
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { previewedJob, setPreviewedJob } from "@/redux/features/utils"

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

const JobPreview = () => {
    const dispatch = useAppDispatch()
    const [isShowApplyButton, setIsShowApplyButton] = useState(false);

    const currentPreviewedJob = useAppSelector(previewedJob)


  return (
    <div className={` ${didact_gothic.className} ${currentPreviewedJob?'fixed':'hidden'} tracking-wider top-0 left-0 right-0 bottom-0 z-[120] `}>
        <button className="fixed top-4 left-2 z-10 cursor-pointer">
            <Image src={evaliaLogo} alt="logo" className=" w-[45px]"/>
        </button>
        <button onClick={()=>dispatch(setPreviewedJob(null))} className="fixed top-3 right-3 z-10 cursor-pointer">
            <Image src={exitLogo} alt="exit" className="w-[18px]"/>
        </button>
      <div className="w-full h-full backdrop-blur-2xl z-10 flex justify-center overflow-hidden ">
        <section className="w-[60%] h-full bg-slate-900/40 flex flex-col justify-start py-[40px] px-[2%]  overflow-y-scroll scrollbar-hidden relative ">
            <div className="absolute w-[250px] h-[80px] rounded-l-full top-[40px] right-0">
                <div className={`w-full h-full rounded-l-full bg-slate-800 flex items-center justify-start pl-2 gap-2 transition-transform duration-500 ${isShowApplyButton?'translate-x-0':' translate-x-[210px]'}`}>
                    <button onClick={()=>setIsShowApplyButton((prev)=>!prev)} className="p-2 rounded-full cursor-pointer">
                        <Image src={isShowApplyButton?rightLogo:leftLogo} alt="direction" className="w-[25px] object-cover"/>
                    </button>
                    <button className="px-2 py-2 rounded-sm border border-gray-300 hover:border-blue-500 text-white font-semibold bg-gray-900 flex justify-center items-center cursor-pointer gap-1">
                       <Image src={saveLogo} alt="save" className="w-[14px]"/>
                       <p className="text-[12px]">Save</p>
                    </button>
                    <button className="px-2 py-2 ml-2 rounded-sm font-bold bg-indigo-700 hover:bg-indigo-600 text-white flex justify-center items-center cursor-pointer gap-1">
                       <Image src={applyLogo} alt="apply" className="w-[14px]"/>
                       <p className="text-[12px]">Apply</p>
                    </button>
                </div>
            </div>
            <div className="w-full h-auto flex flex-col justify-start items-start ">
                <section className="w-[60%] h-auto flex justify-start items-start gap-4">
                    <div className="w-[80px] h-[70px] rounded-xl ">
                        <Image className="w-full h-full rounded-xl object-cover" width={150} height={120} src={'https://i.pinimg.com/1200x/59/7f/11/597f11b631d7d94492f1adb95110cc44.jpg'} alt="company logo" />
                    </div>
                    <div className="flex-1 h-auto flex flex-col items-start ">
                        <p className="font-semibold tracking-widest">Google</p>
                        <p className="w-full h-[40px] overflow-hidden text-[13px] text-gray-300">
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex iusto quos temporibus quia consequatur,
                             laudantium inventore? Aliquam, voluptatibus in nisi ex doloremque id blanditiis iusto placeat ut sapiente, inventore minus.
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6">
                    <p className="font-semibold text-[20px]">Software Engineer</p>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-100">
                        <p className="text-[13px]">{'$70k - $120k'}</p><p>{` | `}</p>
                        <p className="text-[13px]">{'Remote'}</p><p>{` | `}</p>
                        <p className="text-[13px]">{'Senior'}</p><p>{` | `}</p>
                        <p className="text-[13px]">{'Full Time'}</p>
                    </div>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-300">
                        <p className="text-[13px]">{`Posted : ${'2 days ago'} `}</p><p>{` . `}</p>
                        <p className="text-[13px]">{`Application Deadline : `}<span className="text-red-500">{'10-08-2025'}</span></p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">About the opportunity : </p>
                    <p className="text-[12px]">
                        We are looking for an AWS Network Architect who will play a pivotal role in designing, implementing,
                        and maintaining the client`s cloud infrastructure. In this role you will possess deep expertise in AWS, Infrastructure as Code (IaC), 
                        Kubernetes, Observability, and overall cloud infrastructure management.
                        The ideal candidate has the following key skills: AWS Networking, Direct Connect, site-site VPN, BGP ,
                         AWS Firewall setup, Transit gateway, Networking Concepts.
                    </p>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Requirements : </p>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'AWS Expertise'} : `}
                            </span>
                            {'Expertise in AWS services and architecture. Proficiency with Infrastructure as Code (IaC) tools such as Terraform, CloudFormation, and AWS CDK. Strong knowledge of Kubernetes, Docker, and container management. Experience with monitoring and observability tools like Prometheus, Grafana, ELK Stack, and AWS CloudWatch. Solid understanding of CI/CD processes and tools. o Familiarity with security best practices in cloud environments.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Security Architecture'} : `}
                            </span>
                            {'Proven experience in designing and implementing secure cloud architectures. Ability to assess and enhance the security posture of existing AWS infrastructure. Network Security: Expertise in configuring and managing AWS Virtual Private Clouds (VPCs), security groups, and network ACLs. Experience in designing and implementing network security controls for AWS. Identity and Access Management (IAM): Strong understanding of IAM principles and hands-on experience implementing IAM policies and procedures. Proficient in managing user access, roles, and permissions in AWS environments.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Data Security'} : `}
                            </span>
                            {'Knowledge of encryption mechanisms for data in transit and at rest in AWS. Experience in defining and enforcing data classification and handling policies. Scripting and Automation: Proficient in scripting languages such as Python or Shell scripting for automating security tasks. Experience with Infrastructure as Code (IaC) tools for automating security configurations. Compliance and Best Practices: Strong understanding of cloud security best practices, industry standards, and compliance frameworks. Knowledge of regulatory requirements related to cloud security.'}
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Responsibilities : </p>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Architectural Design and Implementation'} : `}
                            </span>
                            {'Design and deploy scalable, highly available, and fault-tolerant systems on AWS. Develop and implement cloud infrastructure solutions using AWS services such as EC2, S3, VPC, RDS, Lambda, etc. Utilize Infrastructure as Code (IaC) tools like Terraform, CloudFormation, and AWS CDK to automate the provisioning and management of AWS resources.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Kubernetes and Containerization'} : `}
                            </span>
                            {'Deploy, manage, and scale Kubernetes clusters on AWS (EKS). Design container orchestration solutions and manage containerized applications. Implement best practices for Kubernetes resource management, networking, and security.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'DevOps and CI/CD'} : `}
                            </span>
                            {'Build and maintain CI/CD pipelines using tools like Jenkins, GitLab CI, AWS CodePipeline, etc. Collaborate with development teams to ensure smooth integration and deployment of applications. Implement automation scripts and tools to streamline operations and improve efficiency.Security and Compliance: Ensure cloud infrastructure security by implementing best practices for IAM, network security, and data protection.Conduct regular security assessments and audits to maintain compliance with industry standards and regulations.'}
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Preferred Skills : </p>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Architectural Design and Implementation'} : `}
                            </span>
                            {'Design and deploy scalable, highly available, and fault-tolerant systems on AWS. Develop and implement cloud infrastructure solutions using AWS services such as EC2, S3, VPC, RDS, Lambda, etc. Utilize Infrastructure as Code (IaC) tools like Terraform, CloudFormation, and AWS CDK to automate the provisioning and management of AWS resources.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'Kubernetes and Containerization'} : `}
                            </span>
                            {'Deploy, manage, and scale Kubernetes clusters on AWS (EKS). Design container orchestration solutions and manage containerized applications. Implement best practices for Kubernetes resource management, networking, and security.'}
                        </p>
                    </div>
                    <div className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${'DevOps and CI/CD'} : `}
                            </span>
                            {'Build and maintain CI/CD pipelines using tools like Jenkins, GitLab CI, AWS CodePipeline, etc. Collaborate with development teams to ensure smooth integration and deployment of applications. Implement automation scripts and tools to streamline operations and improve efficiency.Security and Compliance: Ensure cloud infrastructure security by implementing best practices for IAM, network security, and data protection.Conduct regular security assessments and audits to maintain compliance with industry standards and regulations.'}
                        </p>
                    </div>
                </section>
            </div>
        </section>
      </div>
    </div>
  )
}

export default JobPreview
