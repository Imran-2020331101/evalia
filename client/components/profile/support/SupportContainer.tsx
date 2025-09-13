'use client'

import React, { useState } from 'react'
import {
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Search,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Users,
  Video
} from 'lucide-react'

export default function SupportContainer() {
  const [query, setQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({})
  const faqData = [
    {
      id: 'account',
      title: 'Account & Login',
      items: [
        'How to create an Evalia account',
        'How to reset your password',
        'How to manage your profile and settings',
        'How to enable two-factor authentication'
      ]
    },
    {
      id: 'jobs',
      title: 'Job Posting / Applications',
      items: [
        'How recruiters can create a job posting',
        'How to manage job postings',
        'How candidates can apply to a job',
        'How to track application status'
      ]
    },
    {
      id: 'interview',
      title: 'Interview & Evaluation Tools',
      items: [
        'How to schedule AI-driven interviews',
        'How to view candidate evaluation results',
        'Understanding scoring metrics and video analysis',
        'How to export interview reports'
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      items: [
        'Understanding Evalia subscription plans',
        'How to upgrade or downgrade your plan',
        'Payment methods supported',
        'Refund policy and procedures'
      ]
    },
    {
      id: 'tech',
      title: 'Technical Issues',
      items: [
        'Browser and device compatibility',
        'Troubleshooting audio/video issues during interviews',
        'Error reporting and logging'
      ]
    }
  ]

  function toggleFaq(id: string) {
    setOpenFaq((s) => ({ ...s, [id]: !s[id] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // static page: form handling to be implemented server-side
    alert('Ticket submitted (demo).')
  }

  const filteredFaq = faqData.map((cat) => ({
    ...cat,
    items: cat.items.filter((it) => it.toLowerCase().includes(query.toLowerCase()))
  }))

  return (
    <div className="h-auto  text-slate-200">
      <div className="max-w-6xl h-auto mx-auto px-6 py-12">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            We're here to help you make the most of Evalia. Find answers, guides, and direct support for your recruitment and candidate evaluation needs.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Support options + status */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Mail size={16} /> Contact Us
              </h3>

              <ul className="mt-3 text-sm text-slate-300 space-y-3">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-1 text-slate-200" />
                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-sm text-slate-500">
                      <a href="mailto:support@evallia.com" className="underline">support@evallia.com</a>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MessageSquare size={18} className="mt-1 text-slate-200" />
                  <div>
                    <div className="text-xs text-slate-400">Live Chat</div>
                    <div className="text-sm text-blue-500">Click here to chat with our support team</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-1 text-slate-200" />
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="text-sm text-slate-500">+880-1234-567890</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className=" rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-medium flex items-center gap-2"><FileText size={16} /> System status</h4>
              <div className="mt-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-xs text-slate-600">All systems operational</span>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5" />
                    <div>
                      Minor bug in video playback — scheduled fix: <strong>15 Sep 2025</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Video size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      Scheduled maintenance: <strong>20 Sep 2025, 12:00–14:00 BST</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className=" rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-medium flex items-center gap-2"><Users size={16} /> Community</h4>
              <p className="mt-2 text-sm text-slate-700">Join discussion, share tips, and see best practices.</p>
              <a href="https://community.evallia.com" className="mt-3 inline-block text-sm text-blue-500 underline">Open community forum</a>
            </div>
          </aside>

          {/* Middle - FAQs */}
          <section className="lg:col-span-2 space-y-6">
            <div className=" rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-medium">FAQ / Knowledge Base</h3>

              <div className="mt-4 space-y-4">
                {filteredFaq.map((cat) => (
                  <div key={cat.id} className=" rounded-md p-2 bg-gray-900">
                    <button
                      onClick={() => toggleFaq(cat.id)}
                      className="w-full flex items-center justify-between text-left py-2 px-3"
                      aria-expanded={!!openFaq[cat.id]}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-400">{cat.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{cat.items.length} result{cat.items.length !== 1 ? 's' : ''}</div>
                      </div>

                      <ChevronDown size={18} className={`${openFaq[cat.id] ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                    </button>

                    {openFaq[cat.id] && (
                      <ul className="mt-2 border-t border-slate-700 pt-2 text-sm text-slate-400 space-y-2">
                        {cat.items.length ? (
                          cat.items.map((it, i) => (
                            <li key={i} className="py-1 px-3 rounded hover:bg-gray-800/50">{it}</li>
                          ))
                        ) : (
                          <li className="py-1 px-3 text-xs text-slate-500">No matching topics.</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tutorials */}
            <div className=" rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Tutorials & Guides</h4>
                <p className="mt-2 text-sm text-slate-400">Short step-by-step guides to common tasks.</p>
                <ul className="mt-3 text-sm text-slate-500 space-y-2">
                  <li>Creating a job posting: step-by-step</li>
                  <li>Conducting AI interviews and evaluating candidates</li>
                  <li>Navigating the candidate dashboard</li>
                  <li>Exporting and sharing evaluation reports</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium">Video Walkthroughs (optional)</h4>
                <p className="mt-2 text-sm text-slate-400">Include short video links or thumbnails here.</p>
                <div className="mt-3 space-y-2">
                  <a className="block text-sm text-blue-500 underline">Creating a job posting — 2m</a>
                  <a className="block text-sm text-blue-500 underline">Interview workflow — 3m</a>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className=" bg-gray-900/80 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-medium">Submit a ticket</h3>
              <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <label className="block">
                  <div className="text-xs text-slate-500">Name</div>
                  <input required className="mt-1 w-full rounded-md border border-gray-700 px-3 py-2 text-sm " />
                </label>

                <label className="block">
                  <div className="text-xs text-slate-500">Email</div>
                  <input type="email" required className="mt-1 w-full rounded-md border border-gray-700 px-3 py-2 text-sm " />
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs text-slate-500">Issue type</div>
                  <select className="mt-1 w-full rounded-md border border-gray-700 px-3 py-2 text-sm ">
                    <option>Account</option>
                    <option>Job Posting</option>
                    <option>Interview Tools</option>
                    <option>Billing</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs text-slate-500">Description</div>
                  <textarea rows={4} required className="mt-1 w-full rounded-md border border-gray-700 px-3 py-2 text-sm " />
                </label>

                <label className="block text-xs text-slate-500 md:col-span-2">
                  Attachment (optional)
                  <input type="file" className="mt-1 w-full text-sm" />
                </label>

                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm">
                    <Mail size={14} /> Submit
                  </button>
                </div>
              </form>
            </div>

            {/* Legal / Footer small */}
            <div className="text-xs text-slate-500">
              <div>Privacy • <a href="https://evallia.com/privacy" className="underline text-slate-600">Privacy Policy</a></div>
              <div className="mt-1">Terms • <a href="https://evallia.com/terms" className="underline text-slate-600">Terms of Service</a></div>
              <div className="mt-2">Still need help? <a href="mailto:support@evallia.com" className="underline text-slate-600">support@evallia.com</a></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
