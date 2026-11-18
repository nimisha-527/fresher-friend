import express from "express";
import { getJobListings } from "../controllers/jobListing.ts";

const router = express.Router();

router.get("/jobs-listing", getJobListings);

export default router;
