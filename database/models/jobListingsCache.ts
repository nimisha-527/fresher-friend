import { model, models, Schema } from "mongoose";

export interface ProcessedJobListing {
  id: number;
  title: string;
  companyName: string;
  companyLogo: string;
  location: string;
  roleType: "Internship" | "Fresher" | "Full-Time" | "Contract";
  workMode: string;
  type: string;
  minSalary: string;
  maxSalary: string;
  salaryPeriod: string;
  description: string;
  categories: string[];
  parentCategories: string[];
  skills: string[];
  applicationLink: string;
  pubDate: number;
  expiryDate: number;
}

export interface JobListingsCache {
  cacheKey: string;
  jobs: ProcessedJobListing[];
  generatedAt: Date;
}

const cachedJobSchema = new Schema<ProcessedJobListing>(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLogo: { type: String, default: "" },
    location: { type: String, required: true },
    roleType: {
      type: String,
      enum: ["Internship", "Fresher", "Full-Time", "Contract"],
      required: true,
    },
    workMode: { type: String, required: true },
    type: { type: String, default: "" },
    minSalary: { type: String, required: true },
    maxSalary: { type: String, required: true },
    salaryPeriod: { type: String, required: true },
    description: { type: String, default: "" },
    categories: { type: [String], required: true },
    parentCategories: { type: [String], required: true },
    skills: { type: [String], required: true },
    applicationLink: { type: String, default: "" },
    pubDate: { type: Number, required: true },
    expiryDate: { type: Number, required: true },
  },
  { _id: false },
);

const jobListingsCacheSchema = new Schema<JobListingsCache>({
  cacheKey: { type: String, required: true, unique: true },
  jobs: { type: [cachedJobSchema], required: true },
  generatedAt: { type: Date, required: true },
});

export const JobListingsCacheModel =
  models.JobListingsCache ||
  model<JobListingsCache>("JobListingsCache", jobListingsCacheSchema);
