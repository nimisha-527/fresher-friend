import type { Request, Response } from "express";
import { tagJobsBatch } from "../../genai/tagsJobsWithGemini";
import {
  cleanDescription,
  formatSalaryLPA,
  requiresMultiYearExperience,
} from "../utils";

const jobsApiUrl = "https://himalayas.app/jobs/api/search";

export const getJobListings = async (req: Request, res: Response) => {
  const seniority = req.query.seniority;
  const employmentType = req.query.employment_type;
  const page = req.query.page;

  if (
    (seniority !== undefined && typeof seniority !== "string") ||
    (employmentType !== undefined && typeof employmentType !== "string") ||
    (page !== undefined && typeof page !== "string")
  ) {
    res
      .status(400)
      .json({
        error: "seniority, employment_type, and page must be single values.",
      });
    return;
  }

  if (
    page !== undefined &&
    (!/^\d+$/.test(page) ||
      !Number.isSafeInteger(Number(page)) ||
      Number(page) < 1)
  ) {
    res.status(400).json({ error: "page must be a positive integer." });
    return;
  }

  const query = new URLSearchParams({
    exclude_worldwide: "true",
    country: "IN",
    sort: "recent",
  });
  if (seniority !== undefined) query.set("seniority", seniority);
  if (employmentType !== undefined)
    query.set("employment_type", employmentType);
  if (page !== undefined) query.set("page", page);

  try {
    // 1. Fetch from Himalayas (Entry-level + Internships)
    const upstreamResponse = await fetch(`${jobsApiUrl}?${query.toString()}`);
    if (!upstreamResponse.ok) {
      res.status(502).json({
        error: `Jobs service returned status ${upstreamResponse.status}.`,
      });
      return;
    }

    const himalayasRes = await upstreamResponse.json();
    const { jobs: rawJobs = [] } = himalayasRes;

    // 2. Fast regex pre-filter to drop obvious senior titles before spending LLM tokens
    const filteredRaw = rawJobs
      .filter(
        (j) =>
          !/senior|sr\.|staff|principal|lead|manager|director|head of|vp/i.test(
            j.title,
          ) && !requiresMultiYearExperience(j.description),
      )
      .slice(0, 25); // Batch of 25

    // 3. Send ONLY slim text fields to Gemini (saves tokens)
    const slimBatch = filteredRaw.map((job, idx) => ({
      id: String(idx),
      title: job.title,
      employmentType: job.employmentType,
      seniority: job.seniority,
      rawLocation: (job.locationRestrictions || []).join(", ") || "Other",
      excerpt: cleanDescription(job.description),
    }));

    const taggedJobs = await tagJobsBatch(slimBatch);
    if (!Array.isArray(taggedJobs)) {
      throw new Error("Gemini returned an invalid job tagging response. The response should be an Array.");
    }
    // filter(...) discards missing or malformed tags whose id isn’t a string.
    // map(...) turns each remaining tag into a [id, tag] pair
    // new Map(...) stores those pairs for quick lookup with tagMap.get(String(index)) below.
    const tagMap = new Map(
      taggedJobs
        .filter((tag) => tag && typeof tag.id === "string")
        .map((tag) => [tag.id, tag]),
    );

    // 4. Merge raw Himalayas fields + Gemini tags into your exact target schema
    const formattedJobs = filteredRaw
      .flatMap((job, index) => {
        const ai = tagMap.get(String(index));;

        if (
          !ai ||
          typeof ai.location !== "string" ||
          typeof ai.workMode !== "string" ||
          typeof ai.roleType !== "string" ||
          !["Internship", "Fresher", "Full-Time", "Contract"].includes(ai.roleType)
        ) {
          console.warn(`Skipping job ${job.guid || index}: no complete Gemini classification.`);
          return [];
        }

        // Drop roles that Gemini flagged as requiring > 2 years experience
        if (!ai.isFresherEligible) {
            return [];
        }
        return [{
          id: index + 1,
          title: job.title,
          companyName: job.companyName || "Unknown Company",
          companyLogo: job.companyLogo || "",
          location: ai.location,
          roleType: ai.roleType,
          workMode: ai.workMode,
          type: job.employmentType,
          minSalary: formatSalaryLPA(job.minSalary, job.currency),
          maxSalary: formatSalaryLPA(job.maxSalary, job.currency),
          salaryPeriod: job.salaryPeriod || "annual",
          description: job.description,
          categories: job.categories || [],
          parentCategories: job.parentCategories || [],
          skills: Array.isArray(ai.skills) ? ai.skills : [],
        }];
      });
    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Failed to fetch job listings:", error);
    res
      .status(502)
      .json({ error: "Unable to fetch job listings from the jobs service." });
  }
};
