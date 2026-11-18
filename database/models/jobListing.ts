import { model, models, Schema } from "mongoose";

export interface JobListing {
    title: string;
    excerpt: string;
    companyName: string;
    companySlug: string;
    companyLogo: string;
    employmentType: string;
    minSalary: string;
    maxSalary: string;
    salaryPeriod: string;
    seniority: string[];
    currency: string;
    locationRestrictions: string[];
    timezoneRestrictions: number[];
    categories: string[];
    parentCategories: string[];
    description: string;
    pubDate: number;
    expiryDate: number;
    applicationLink: string;
    guid: string;
}

const jobListingSchema = new Schema<JobListing>({
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    companyName: { type: String, required: true },
    companySlug: { type: String, required: true },
    companyLogo: { type: String, required: true },
    employmentType: { type: String, required: true },
    minSalary: { type: String, required: true },
    maxSalary: { type: String, required: true },
    salaryPeriod: { type: String, required: true },
    seniority: { type: [String], required: true },
    currency: { type: String, required: true },
    locationRestrictions: { type: [String], required: true },
    timezoneRestrictions: { type: [Number], required: true },
    categories: { type: [String], required: true },
    parentCategories: { type: [String], required: true },
    description: { type: String, required: true },
    pubDate: { type: Number, required: true },
    expiryDate: { type: Number, required: true },
    applicationLink: { type: String, required: true },
    guid: { type: String, required: true },
});

export const JobListingModel =
    models.JobListing || model<JobListing>("JobListing", jobListingSchema);
