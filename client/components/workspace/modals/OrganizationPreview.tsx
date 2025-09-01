'use client'

import { previewOrganization, setPreviewOrganization } from '@/redux/features/utils'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import React, { useEffect, useRef, useState } from 'react'
import { Building2, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function OrganizationPreviewModal() {
  const [copied, setCopied] = useState('')
  const modalRef = useRef<HTMLDivElement|null>(null)
  const dispatch = useAppDispatch()
  const org = useAppSelector(previewOrganization)
  const currentPreviewedOrg = useAppSelector(previewOrganization)

  const {
    organizationName,
    organizationNameBangla,
    organizationProfileImageUrl,
    yearOfEstablishment,
    numberOfEmployees,
    organizationAddress,
    organizationAddressBangla,
    industryType,
    businessDescription,
    businessLicenseNo,
    rlNo,
    websiteUrl,
    enableDisabilityFacilities,
    acceptPrivacyPolicy,
    verified,
    ownerEmail,
    createdAt,
    updatedAt
  } = currentPreviewedOrg  || {}


  const fmt = (iso:string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return '-'
    }
  }

  const copyToClipboard = async (text:any, tag:any) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(tag)
      setTimeout(() => setCopied(''), 1800)
    } catch (e) {
      console.error('copy failed', e)
    }
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
        ) {
            dispatch(setPreviewOrganization(null))
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);
  return (
    <div
      className={`${currentPreviewedOrg?'fixed':'hidden'} inset-0 z-[200] flex items-center justify-center`}
      aria-modal="true"
      role="dialog"
      aria-label={`${organizationName || 'Organization'} preview`}
    >
      {/* Overlay */}
      <div
        
        className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
      />

      {/* Modal panel */}
      <div ref={modalRef} className="relative w-[37%] overflow-hidden rounded-2xl bg-slate-900 text-slate-100 shadow-2xl ring-1 ring-white/5">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {/* Left - Logo & quick info */}
          <div className="w-[40%] flex flex-col items-center gap-4">
            {/* Logo */}
            <div className="w-full max-w-[220px]">
            {
                organizationProfileImageUrl?
                    <Image
                    src={organizationProfileImageUrl || ''}
                    alt={`${organizationName || 'Org'} logo`}
                    width={300} 
                    height={400}
                    className="aspect-square w-full rounded-xl object-cover border border-white/5 shadow-md"
                    />
                :null
            }
            </div>


            {/* Organization name */}
            <div className="w-full text-center">
            <h3 className="text-lg md:text-xl font-semibold truncate">
            {organizationName || '-'} <span className='text-xs text-gray-200'>{ yearOfEstablishment?`( ${yearOfEstablishment} )`:''}</span>
            </h3>
            {organizationNameBangla ? (
            <p className="text-sm text-slate-400 mt-1">
            {organizationNameBangla}
            </p>
            ) : null}


            {/* Industry + Employees */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-800/60 px-3 py-1 text-sm font-medium">
            <Building2 className="h-4 w-4" />
            {industryType || '—'}
            </span>


            <span
            className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium"
            style={{
            backgroundColor: 'rgba(99,102,241,0.08)',
            color: '#6366f1'
            }}
            >
            <Users className="h-4 w-4" />
            {numberOfEmployees || 'N/A'}
            </span>
            </div>


            {/* Verification badge */}
            <div className="mt-3 flex items-center justify-center gap-2">
            {verified ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-600/10 px-3 py-1 text-sm font-semibold text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            Verified
            </span>
            ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-600/10 px-3 py-1 text-sm font-semibold text-yellow-300">
            <AlertCircle className="h-4 w-4" />
            Not verified
            </span>
            )}
            </div>
            </div>
            </div>

          {/* Middle - Details */}
          <div className="w-[60%] flex flex-col gap-4">
            <div>
              <h4 className="text-sm text-slate-200 font-medium">Business description</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 max-h-[160px] overflow-auto">{businessDescription || '—'}</p>
            </div>

            <div>
              <h4 className="text-sm text-slate-200 font-medium">Address</h4>
              <p className="mt-2 text-sm text-slate-300">{organizationAddress || organizationAddressBangla || '—'}</p>
            </div>

            <div>
              <h4 className="text-sm text-slate-300 font-medium">Business / License</h4>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between rounded-md bg-slate-800/40 px-3 py-2">
                  <span className="text-slate-300">Business license</span>
                  <span className="font-medium text-slate-400">{businessLicenseNo || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm text-slate-200 font-medium">Contact</h4>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 rounded-md text-gray-300 bg-slate-800/40 px-3 py-2 text-sm">
                    <div className="truncate">{ownerEmail || '-'}</div>
                  </div>
                  <button
                    onClick={() => ownerEmail && copyToClipboard(ownerEmail, 'email')}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-700/50 px-3 py-2 text-sm font-medium hover:bg-slate-700"
                  >
                    {copied === 'email' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-slate-200 font-medium">Website</h4>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={websiteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate rounded-md text-gray-300 bg-slate-800/40 px-3 py-2 text-sm hover:underline"
                  >
                    {websiteUrl || '-'}
                  </a>
                  <button
                    onClick={() => websiteUrl && copyToClipboard(websiteUrl, 'site')}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-700/50 px-3 py-2 text-sm font-medium hover:bg-slate-700"
                  >
                    {copied === 'site' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <p className={`text-xs text-gray-300`}>Privacy accepted: <span className={`${acceptPrivacyPolicy?'text-green-500':'text-gray-400'} `}>{acceptPrivacyPolicy ? 'Yes' : 'No'}</span> </p>
            <div className="mt-2 flex items-center justify-end gap-3 w-full">
              <a
                href={websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-4 py-2 text-sm w-full flex justify-center font-semibold bg-indigo-600 hover:bg-indigo-500"
              >
                Visit website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
