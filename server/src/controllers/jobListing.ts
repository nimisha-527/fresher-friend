import type { Request, Response } from "express";

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
        res.status(400).json({ error: "seniority, employment_type, and page must be single values." });
        return;
    }

    if (
        page !== undefined &&
        (!/^\d+$/.test(page) || !Number.isSafeInteger(Number(page)) || Number(page) < 1)
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
    if (employmentType !== undefined) query.set("employment_type", employmentType);
    if (page !== undefined) query.set("page", page);

    try {
        const upstreamResponse = await fetch(`${jobsApiUrl}?${query.toString()}`);
        if (!upstreamResponse.ok) {
            res.status(502).json({
                error: `Jobs service returned status ${upstreamResponse.status}.`,
            });
            return;
        }

        const jobs = await upstreamResponse.json();
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Failed to fetch job listings:", error);
        res.status(502).json({ error: "Unable to fetch job listings from the jobs service." });
    }
};
