import express from "express";
import { getJobListings } from "../controllers/jobListing.ts";
import { getFilterOpportunities } from "../controllers/filterOpportunities.ts";
import { postJobCheckAI } from "../controllers/jobCheckAI.ts";

const router = express.Router();

router.get("/jobs-listing", getJobListings);
router.get("/filter-opportunities", getFilterOpportunities);
router.post("/job-check-ai", postJobCheckAI);

export default router;
