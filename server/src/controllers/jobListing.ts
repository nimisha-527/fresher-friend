import type { Request, Response } from "express";
import { JobListingsCacheModel } from "../../../database";
import {
  jobListingsCacheDurationMs,
  jobListingsCacheKey,
  processAndCacheJobsWithAI,
} from "./jobCheckAI";
import type { JobListing } from "../types/jobListing";

const jobsPerPage = 20;

let refreshInProgress: Promise<JobListing[]> | undefined;

export async function getAllJobListings(): Promise<JobListing[]> {
  const cached = await JobListingsCacheModel.findOne({
    cacheKey: jobListingsCacheKey,
  }).lean();
  if (
    cached &&
    Date.now() - cached.generatedAt.getTime() < jobListingsCacheDurationMs
  ) {
    return cached.jobs;
  }

  if (!refreshInProgress) {
    refreshInProgress = processAndCacheJobsWithAI()
      .then(({ jobs }) => jobs)
      .finally(() => {
        refreshInProgress = undefined;
      });
  }

  return refreshInProgress;
}

export async function getJobListings(req: Request, res: Response) {
  const pageQuery = req.query.page;
  let page = 1;

  if (pageQuery !== undefined) {
    if (
      typeof pageQuery !== "string" ||
      !/^\d+$/.test(pageQuery) ||
      !Number.isSafeInteger(Number(pageQuery)) ||
      Number(pageQuery) < 1
    ) {
      res.status(400).json({ error: "page must be a positive integer." });
      return;
    }

    page = Number(pageQuery);
  }

  try {
    const allJobs = await getAllJobListings();
    const totalJobs = allJobs.length;
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    const startIndex = (page - 1) * jobsPerPage;

    res.status(200).json({
      jobs: allJobs.slice(startIndex, startIndex + jobsPerPage),
      page,
      pageSize: jobsPerPage,
      totalJobs,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch job listings:", error);
    res.status(502).json({
      error: "Unable to fetch and classify job listings.",
    });
  }
}
