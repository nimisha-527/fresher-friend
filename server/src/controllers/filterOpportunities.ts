import type { Request, Response } from "express";
import { getAllJobListings } from "./jobListing";
import type { JobListing } from "../types/jobListing";

const notDisclosedSalary = "Not Disclosed";

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim() !== ""))];
}

function getSalaryFilterValue(job: JobListing): string {
  const minSalary = job.minSalary.trim();
  if (minSalary !== "" && minSalary.toLowerCase() !== "not disclosed") {
    return minSalary;
  }

  const maxSalary = job.maxSalary.trim();
  if (maxSalary !== "" && maxSalary.toLowerCase() !== "not disclosed") {
    return maxSalary;
  }

  return notDisclosedSalary;
}

function getSalaryRangeOptions(jobs: JobListing[]): string[] {
  return uniqueValues(jobs.map(getSalaryFilterValue));
}

export async function getFilterOpportunities(_req: Request, res: Response) {
  try {
    const jobs = await getAllJobListings();
    res.status(200).json({
      location: uniqueValues(jobs.map((job) => job.location)),
      workMode: uniqueValues(jobs.map((job) => job.workMode)),
      roleType: uniqueValues(jobs.map((job) => job.roleType)),
      parentCategories: uniqueValues(
        jobs.flatMap((job) => job.parentCategories),
      ),
      salaryRange: getSalaryRangeOptions(jobs),
      categories: uniqueValues(jobs.flatMap((job) => job.categories)),
    });
  } catch (error) {
    console.error("Failed to fetch job filter options:", error);
    res.status(502).json({
      error: "Unable to fetch job filter options.",
    });
  }
}
