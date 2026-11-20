export interface JobListing {
  id: number
  title: string
  companyName: string
  companyLogo: string
  location: string
  roleType: string
  workMode: string
  type: string
  minSalary: string
  maxSalary: string
  salaryPeriod: string
  description: string
  categories: string[]
  parentCategories: string[]
  skills: string[]
  applicationLink: string
  pubDate: number
  expiryDate: number
}
