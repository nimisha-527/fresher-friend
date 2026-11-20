import type { Request, Response } from "express";
import {
  tagJobsBatch,
  type TokenUsage,
} from "../../genai/tagsJobsWithGemini";
import {
  cleanDescription,
  formatSalaryLPA,
  requiresMultiYearExperience,
} from "../utils";
import { JobListingsCacheModel } from "../../../database";
import type { HimalayasJob, JobListing } from "../types/jobListing";

const jobsApiUrl = "https://himalayas.app/jobs/api/search";
const sourcePageCount = 15;
const jobBatchSize = 20;
const cacheKey = "india-recent-jobs";

const allowedRoleTypes = [
  "Internship",
  "Fresher",
  "Full-Time",
  "Contract",
] as const;

function isAllowedRoleType(roleType: string): roleType is JobListing["roleType"] {
  return allowedRoleTypes.some((allowedRoleType) => allowedRoleType === roleType);
}

interface JobTag {
  id: string;
  location?: unknown;
  workMode?: unknown;
  roleType?: unknown;
  isFresherEligible?: unknown;
  skills?: unknown;
}

function isJobTag(tag: unknown): tag is JobTag {
  return (
    !!tag &&
    typeof tag === "object" &&
    "id" in tag &&
    typeof tag.id === "string"
  );
}

function isHimalayasJob(job: unknown): job is HimalayasJob {
  return (
    !!job &&
    typeof job === "object" &&
    "title" in job &&
    typeof job.title === "string" &&
    "description" in job &&
    typeof job.description === "string"
  );
}

interface JobCheckResult {
  jobs: JobListing[];
  tokenUsage: TokenUsage;
}

function sumTokenCounts(
  current: number | null,
  additional: number | null,
): number | null {
  return current === null || additional === null
    ? null
    : current + additional;
}

export async function checkJobsWithAI(
  rawJobs: HimalayasJob[],
  sourceOffset = 0,
): Promise<JobCheckResult> {
  const filteredJobs = rawJobs
    .map((job, index) => ({ job, index }))
    .filter(
      ({ job }) =>
        !/senior|sr\.|staff|principal|lead|manager|director|head of|vp/i.test(
          job.title,
        ) && !requiresMultiYearExperience(job.description),
    );

  if (filteredJobs.length === 0) {
    return {
      jobs: [],
      tokenUsage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const slimBatch = filteredJobs.map(({ job, index }) => ({
    id: String(sourceOffset + index),
    title: job.title,
    employmentType: job.employmentType || "",
    seniority: job.seniority || [],
    rawLocation: (job.locationRestrictions || []).join(", ") || "Other",
    excerpt: cleanDescription(job.description),
  }));

  const { jobs: taggedJobs, tokenUsage } = await tagJobsBatch(slimBatch);
  if (!Array.isArray(taggedJobs)) {
    throw new Error(
      "Gemini returned an invalid job tagging response. The response should be an Array.",
    );
  }

  const tagMap = new Map(
    taggedJobs
      .filter(isJobTag)
      .map((tag) => [tag.id, tag]),
  );

  const jobs = filteredJobs.flatMap(({ job, index }) => {
    const listingId = sourceOffset + index;
    const ai = tagMap.get(String(listingId));

    if (
      !ai ||
      typeof ai.location !== "string" ||
      typeof ai.workMode !== "string" ||
      typeof ai.roleType !== "string" ||
      !isAllowedRoleType(ai.roleType)
    ) {
      console.warn(
        `Skipping job ${job.guid || listingId}: no complete Gemini classification.`,
      );
      return [];
    }

    if (!ai.isFresherEligible) {
      return [];
    }

    return [
      {
        id: listingId + 1,
        title: job.title,
        companyName: job.companyName || "Unknown Company",
        companyLogo: job.companyLogo || "",
        location: ai.location,
        roleType: ai.roleType,
        workMode: ai.workMode,
        type: job.employmentType || "",
        minSalary: formatSalaryLPA(job.minSalary, job.currency),
        maxSalary: formatSalaryLPA(job.maxSalary, job.currency),
        salaryPeriod: job.salaryPeriod || "annual",
        description: job.description,
        categories: job.categories || [],
        parentCategories: job.parentCategories || [],
        skills: Array.isArray(ai.skills) ? ai.skills : [],
        applicationLink: job.applicationLink || "",
        pubDate: job.pubDate || 0,
        expiryDate: job.expiryDate || 0,
      },
    ];
  });

  return { jobs, tokenUsage };
}

export async function processAndCacheJobsWithAI(): Promise<JobCheckResult> {
  const listings: JobListing[] = [];
  const tokenUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  let sourceOffset = 0;

  for (let page = 1; page <= sourcePageCount; page += 1) {
    const query = new URLSearchParams({
      exclude_worldwide: "true",
      country: "IN",
      sort: "recent",
      page: String(page),
    });
    const upstreamResponse = await fetch(`${jobsApiUrl}?${query.toString()}`);

    if (!upstreamResponse.ok) {
      throw new Error(
        `Jobs service returned status ${upstreamResponse.status} for page ${page}.`,
      );
    }

    const payload: unknown = await upstreamResponse.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("jobs" in payload) ||
      !Array.isArray(payload.jobs)
    ) {
      throw new Error(`Jobs service returned an invalid response for page ${page}.`);
    }

    const pageJobs = payload.jobs;
    if (!pageJobs.every(isHimalayasJob)) {
      throw new Error(`Jobs service returned malformed jobs for page ${page}.`);
    }

    for (let offset = 0; offset < pageJobs.length; offset += jobBatchSize) {
      const batchResult = await checkJobsWithAI(
        pageJobs.slice(offset, offset + jobBatchSize),
        sourceOffset + offset,
      );
      listings.push(...batchResult.jobs);
      tokenUsage.inputTokens = sumTokenCounts(
        tokenUsage.inputTokens,
        batchResult.tokenUsage.inputTokens,
      );
      tokenUsage.outputTokens = sumTokenCounts(
        tokenUsage.outputTokens,
        batchResult.tokenUsage.outputTokens,
      );
    }

    sourceOffset += pageJobs.length;
  }

  await JobListingsCacheModel.findOneAndUpdate(
    { cacheKey },
    { cacheKey, jobs: listings, generatedAt: new Date() },
    { upsert: true, new: true, runValidators: true },
  );

  return { jobs: listings, tokenUsage };
}

export async function postJobCheckAI(_req: Request, res: Response) {
  try {
    res.status(200).json(await processAndCacheJobsWithAI());
  } catch (error) {
    console.error("Failed to check jobs with AI:", error);
    res.status(502).json({ error: "Unable to classify jobs with AI." });
  }
}
