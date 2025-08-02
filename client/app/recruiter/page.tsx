'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Roboto_Mono } from "next/font/google"

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
})

interface FormData {
  // User Information
  username: string
  password: string
  confirmPassword: string
  
  // Company Information
  companyName: string
  companyNameBangla: string
  yearOfEstablishment: string
  numberOfEmployees: string
  companyAddress: string
  companyAddressBangla: string
  industryType: string
  businessDescription: string
  businessLicenseNo: string
  rlNo: string
  websiteUrl: string
  
  // Contact Person Information
  contactPersonName: string
  contactPersonDesignation: string
  contactPersonEmail: string
  contactPersonMobile: string
  
  // Accessibility
  enableDisabilityFacilities: boolean
  
  // Agreement
  acceptPrivacyPolicy: boolean
  captchaAnswer: string
}

const RecruiterRegisterPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyNameBangla: '',
    yearOfEstablishment: '',
    numberOfEmployees: '',
    companyAddress: '',
    companyAddressBangla: '',
    industryType: '',
    businessDescription: '',
    businessLicenseNo: '',
    rlNo: '',
    websiteUrl: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonEmail: '',
    contactPersonMobile: '',
    enableDisabilityFacilities: false,
    acceptPrivacyPolicy: false,
    captchaAnswer: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)

  const employeeRanges = [
    '1-25',
    '26-50', 
    '51-100',
    '101-500',
    '501-1000',
    '1000+'
  ]

  const industryTypes = [
    'Advertising Agency',
    'Advertising Technology (AdTech) Startup',
    'Agro based firms (incl. Agro Processing/Seed/GM)',
    'Agro based Startup',
    'Airline',
    'Airport Service',
    'Amusement Park',
    'Animal/Plant Breeding',
    'Architecture Firm',
    'Artificial Intelligence (AI) Startup',
    'Audit Firms /Tax Consultant',
    'Automobile',
    'Bakery (Cake, Biscuit, Bread)',
    'Banks',
    'Bar/Pub',
    'Battery, Storage cell',
    'Beauty Parlor/Saloon/Spa',
    'Beverage',
    'Bicycle',
    'Boutique/ Fashion',
    'BPO/ Data Entry Firm',
    'Brick',
    'Business-to-Business (B2B) Software and Services Startup',
    'Buying House',
    'Call Center',
    'Catering',
    'Cellular Phone Operator',
    'Cement',
    'Cement Industry',
    'Chain shop',
    'Chamber',
    'Chemical Industries',
    'Cinema Hall/Theater',
    'Clearing and Forwarding (C and F) Companies',
    'Clinic',
    'Club',
    'CNG',
    'CNG Conversion',
    'Coaching Center',
    'Coal',
    'Coffee Shop',
    'College',
    'Computer Hardware/Network Companies',
    'Consulting Firms',
    'Convention center',
    'Corrugated Tin',
    'Cosmetics/Toiletries/Personal Care',
    'Credit Rating Agency',
    'Crockeries',
    'Cultural Centre',
    'Dairy',
    'Delivery Services Startup',
    'Departmental store',
    'Design/Printing/Publishing',
    'Developer',
    'Development Agency',
    'Diagnostic Centre',
    'Direct Selling/Marketing Service Company',
    'Dry cell (Battery)',
    'DTP House',
    'Dyeing Factory',
    'E-commerce',
    'E-commerce Startup',
    'Educational Technology (Edtech) Startup',
    'Electric Wire/Cable',
    'Electronic Equipment/Home Appliances',
    'Embassies/Foreign Consulate',
    'Engineering Firms',
    'Escalator/Elevator/Lift',
    'Event Management',
    'F-commerce',
    'Farming',
    'Fast Food Shop',
    'Filling Station',
    'Film Production',
    'Financial Consultants',
    'Financial Technology (Fintech) Startup',
    'Fire Fighting and Safety',
    'Fisheries',
    'Focus Auto Brick and ceramics',
    'Food (Packaged)',
    'Food (Packaged)/Beverage',
    'Freight forwarding',
    'Fuel/Petroleum',
    'Furniture',
    'Furniture Manufacturer',
    'Gallery',
    'Garments',
    'Garments Accessories',
    'Gas',
    'Golf Club',
    'Govt./ Semi Govt./ Autonomous body',
    'Grocery shop',
    'Group of Companies',
    'GSA',
    'Handicraft',
    'Hatchery',
    'Healthcare Startup',
    'Healthcare/Lifestyle product',
    'Herbal Medicine',
    'Hospital',
    'Hostel',
    'Hotel',
    'HVAC System',
    'Ice Cream',
    'Immigration and Education Consultancy Service',
    'Immigration/Visa Processing',
    'Importer',
    'Indenting',
    'Indenting Firm',
    'Individual/Personal Recruitment',
    'Industrial Machineries (Generator, Diesel Engine etc.)',
    'Insurance',
    'Interior Design',
    'Inventory/Warehouse',
    'Investment/Merchant Banking',
    'ISP',
    'IT Enabled Service',
    'Jewelry/Gem',
    'Jute Goods/ Jute Yarn',
    'Kindergarten',
    'Lamps',
    'Land Phone',
    'Law Firm',
    'Leasing',
    'Livestock',
    'Logistic/Courier/Air Express Companies',
    'Logistics Startup',
    'LPG Gas/Cylinder Gas',
    'Madrasa',
    'Manpower Recruitment',
    'Manufacturing (FMCG)',
    'Manufacturing (Light Engineering and Heavy Industry)',
    'Market Research Firms',
    'Medical Equipment',
    'Micro-Credit',
    'Mineral Water',
    'Mining',
    'Mobile Accessories',
    'Motel',
    'Motor Vehicle body manufacturer',
    'Motor Workshop',
    'Multinational Companies',
    'Museum',
    'Newspaper/Magazine',
    'NGO',
    'Online Newspaper/ News Portal',
    'Online Retail Startup',
    'Online Streaming Startup',
    'Overseas Companies',
    'Packaging Industry',
    'Paint',
    'Paper',
    'Park',
    'Party/ Community Center',
    'Pest Control',
    'Pharmaceutical/Medicine Companies',
    'Physiotherapy center',
    'Plastic/ Polymer Industry',
    'Port Service',
    'Pottery',
    'Poultry',
    'Power',
    'Professional Photographers',
    'PSTN',
    'Public Relation Companies',
    'Radio',
    'Real Estate',
    'Real Estate Startup',
    'Religious Place',
    'Reptile Firms',
    'Research Organization',
    'Resort',
    'Restaurant',
    'Retail Store',
    'SALES EXECUTIVE',
    'Salt',
    'Sanitary ware',
    'Satellite TV',
    'School',
    'Science Laboratory',
    'Security Service',
    'Share Brokerage/ Securities House',
    'Shared Mobility Startup',
    'Shipping',
    'Shipyard',
    'Shop/Showroom',
    'Shopping mall',
    'Shrimp',
    'Software Company',
    'Spinning',
    'Sports Complex',
    'Steel',
    'Super store',
    'Supply Chain',
    'Sweater Industry',
    'Swimming Pool',
    'Tailor shop',
    'Tannery/Footwear',
    'Tea Garden',
    'Technical Infrastructure',
    'Telecommunication',
    'Textile',
    'Third Party Auditor (Quality, Health, Environment, Compliance)',
    'Tiles/Ceramic',
    'Tobacco',
    'Toiletries',
    'Tour Operator',
    'Toy',
    'Trading or Export/Import',
    'Training Institutes',
    'Transport Service',
    'Transport Startup',
    'Transportation',
    'Travel Agent',
    'Travel Startup',
    'Tyre manufacturer',
    'University',
    'Venture Capital Firm',
    'Washing Factory',
    'Watch',
    'Web Media/Blog',
    'Wholesale'
  ]

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // User Information validation
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Company Information validation
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.yearOfEstablishment) newErrors.yearOfEstablishment = 'Year of establishment is required'
    if (!formData.numberOfEmployees) newErrors.numberOfEmployees = 'Number of employees is required'
    if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required'
    if (!formData.industryType) newErrors.industryType = 'Industry type is required'

    // Contact Person validation
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required'
    if (!formData.contactPersonDesignation.trim()) newErrors.contactPersonDesignation = 'Contact person designation is required'
    if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = 'Contact person email is required'
    if (!formData.contactPersonMobile.trim()) newErrors.contactPersonMobile = 'Contact person mobile is required'

    // Captcha validation
    if (formData.captchaAnswer !== '7') newErrors.captchaAnswer = 'Incorrect answer'

    // Privacy policy validation
    if (!formData.acceptPrivacyPolicy) newErrors.acceptPrivacyPolicy = 'You must accept the privacy policy'

    setErrors(newErrors as Partial<FormData>)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register/recruiter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        router.push('/auth/login?message=Registration successful! Please login.')
      } else {
        // Handle registration error
        console.error('Registration failed:', data.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 pt-25 ${robotoMono.className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-indigo-950 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Employer Registration Form</h1>
            <p className="text-blue-100 mt-2">Join our platform to find the best talent for your organization</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">
            {/* User Information Section */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">1</span>
                Let's Start by Filling Out Your User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">2</span>
                Tell Us About Your Company
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    কোম্পানির নাম (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={formData.companyNameBangla}
                    onChange={(e) => handleInputChange('companyNameBangla', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="কোম্পানির নাম বাংলায় লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year of Establishment <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    value={formData.yearOfEstablishment}
                    onChange={(e) => handleInputChange('yearOfEstablishment', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="e.g., 2010"
                  />
                  {errors.yearOfEstablishment && <p className="text-red-400 text-sm mt-1">{errors.yearOfEstablishment}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Employees <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.numberOfEmployees}
                    onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select employee range</option>
                    {employeeRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                  {errors.numberOfEmployees && <p className="text-red-400 text-sm mt-1">{errors.numberOfEmployees}</p>}
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Address <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.companyAddress}
                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder="Enter complete company address"
                      />
                      {errors.companyAddress && <p className="text-red-400 text-sm mt-1">{errors.companyAddress}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        কোম্পানির ঠিকানা (বাংলায়)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.companyAddressBangla}
                        onChange={(e) => handleInputChange('companyAddressBangla', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder="কোম্পানির সম্পূর্ণ ঠিকানা বাংলায় লিখুন"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.industryType}
                    onChange={(e) => handleInputChange('industryType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select industry type</option>
                    {industryTypes.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  {errors.industryType && <p className="text-red-400 text-sm mt-1">{errors.industryType}</p>}
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Describe your business activities and services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business/ Trade License No
                  </label>
                  <input
                    type="text"
                    value={formData.businessLicenseNo}
                    onChange={(e) => handleInputChange('businessLicenseNo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    RL No.(Only for Recruiting Agency)
                  </label>
                  <input
                    type="text"
                    value={formData.rlNo}
                    onChange={(e) => handleInputChange('rlNo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter RL number if applicable"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="https://www.yourcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person Information Section */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">3</span>
                Provide Contact Person Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person's Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPersonName}
                    onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter contact person's name"
                  />
                  {errors.contactPersonName && <p className="text-red-400 text-sm mt-1">{errors.contactPersonName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person's Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPersonDesignation}
                    onChange={(e) => handleInputChange('contactPersonDesignation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="e.g., HR Manager"
                  />
                  {errors.contactPersonDesignation && <p className="text-red-400 text-sm mt-1">{errors.contactPersonDesignation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person's Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="contact@company.com"
                  />
                  {errors.contactPersonEmail && <p className="text-red-400 text-sm mt-1">{errors.contactPersonEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person's Mobile <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPersonMobile}
                    onChange={(e) => handleInputChange('contactPersonMobile', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="+880-xxxx-xxxxxx"
                  />
                  {errors.contactPersonMobile && <p className="text-red-400 text-sm mt-1">{errors.contactPersonMobile}</p>}
                </div>
              </div>
            </div>

            {/* Accessibility Section */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">4</span>
                Accessibility Profile for Inclusion of Persons with Disabilities
              </h2>
              <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="disability-facilities"
                    checked={formData.enableDisabilityFacilities}
                    onChange={(e) => handleInputChange('enableDisabilityFacilities', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700 rounded"
                  />
                  <div>
                    <label htmlFor="disability-facilities" className="text-sm font-medium text-white">
                      Enable Facilities for Person with Disabilities as Employees
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      By checking this box, you commit to providing an inclusive workplace for persons with disabilities.
                    </p>
                    <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium">Learn More</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Section */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">5</span>
                You're Almost Done!
              </h2>
              
              {/* Captcha */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Security Question: 8 - 1 = ?
                </label>
                <input
                  type="text"
                  value={formData.captchaAnswer}
                  onChange={(e) => handleInputChange('captchaAnswer', e.target.value)}
                  className="w-24 px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Answer"
                />
                {errors.captchaAnswer && <p className="text-red-400 text-sm mt-1">{errors.captchaAnswer}</p>}
              </div>

              {/* Privacy Policy */}
              <div className="mb-8">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy-policy"
                    checked={formData.acceptPrivacyPolicy}
                    onChange={(e) => handleInputChange('acceptPrivacyPolicy', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700 rounded"
                  />
                  <label htmlFor="privacy-policy" className="text-sm text-gray-300">
                    I have read and accepted the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Privacy Policy</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Pricing Policy of Bdjobs.com recruitment services</a>
                  </label>
                </div>
                {errors.acceptPrivacyPolicy && <p className="text-red-400 text-sm mt-1">You must accept the privacy policy</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-12 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering...
                    </div>
                  ) : (
                    'Register Company'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RecruiterRegisterPage
