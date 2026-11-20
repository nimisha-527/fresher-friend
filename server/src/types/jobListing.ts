import type { ProcessedJobListing } from "../../../database";

export type JobListing = ProcessedJobListing;

export interface HimalayasJob {
  title: string;
  employmentType?: string;
  seniority?: string[];
  locationRestrictions?: string[];
  description: string;
  companyName?: string;
  companyLogo?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryPeriod?: string;
  categories?: string[];
  parentCategories?: string[];
  applicationLink?: string;
  pubDate?: number;
  expiryDate?: number;
  guid?: string;
}
