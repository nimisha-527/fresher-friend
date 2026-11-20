# Server App

This folder contains the backend API for the project. It is built with Express, TypeScript, MongoDB, and session-based authentication support.

# Change logs

 - Updated: src/index.ts - using express routing <Last Updated: 18/11/2026>
 - Added: routes/ - initial content API added <Last Updated: 18/11/2026>
- Added: api-data/initialContent.json - initial content introduced <Last Updated: 18/11/2026>
 - Added: src/controllers/jobListing.ts - Added the Himalayas jobs API controller with country, seniority, and page query handling <Last Updated: 18/11/2026>
 - Added: src/route/jobListing.ts - Added the GET /fresherFriend/job-listing route <Last Updated: 18/11/2026>
 - Updated: src/route/jobListing.ts - Also accept /fresherFriend/jobs-listing as an alias <Last Updated: 18/11/2026>
 - Updated: src/index.ts - Mounted job listings under the /fresherFriend prefix <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Use fixed country/sort/worldwide filters and forward employment_type, seniority, and page query parameters <Last Updated: 18/11/2026>
 - Updated: src/route/jobListing.ts - Support both job-listing and jobs-listing paths <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Remove the page query parameter <Last Updated: 18/11/2026>
 - Updated: src/route/jobListing.ts - Keep only the /fresherFriend/jobs-listing endpoint <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Restore optional page query validation and forwarding <Last Updated: 18/11/2026>
  - Updated: src/controllers/jobListing.ts - Added new package for genai and importing it for testing <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Await asynchronous Gemini job tagging before mapping results <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Skip listings without complete Gemini classifications rather than dereferencing missing tags <Last Updated: 18/11/2026>
 - Updated: src/controllers/jobListing.ts - Return Himalayas locationRestrictions as the response location array <Last Updated: 18/11/2026>
 - Updated: ../server/genai/tagsJobsWithGemini.ts - Add AI role-type classification to the response schema and prompt <Last Updated: 20/11/2026>
- Updated: ../server/src/controllers/jobListing.ts - Send role classification inputs to Gemini and use AI role type and upstream timestamps in listings <Last Updated: 20/11/2026>
 - Updated: src/controllers/jobListing.ts - Return 20 MongoDB-cached listings per /jobs-listing?page=N response with pagination metadata and trigger refresh through the AI-check workflow <Last Updated: 20/11/2026>
 - Added: src/controllers/jobCheckAI.ts - Fetch 15 Himalayas pages, deduplicate jobs by GUID/title/company before AI checks, persist the snapshot after successful processing, return token usage, and schedule refreshes 24 hours after successful generation <Last Updated: 20/11/2026>
 - Added: src/controllers/filterOpportunities.ts - Return distinct filter options derived from all cached classified jobs through GET /fresherFriend/filter-opportunities; salary options use minSalary, fall back to maxSalary, or use Not Disclosed, preserving the displayed currency or LPA unit <Last Updated: 20/11/2026>
 - Updated: src/controllers/filterOpportunities.ts - Include distinct roleType values from jobs classified by /job-check-api in filter opportunities <Last Updated: 20/11/2026>
 - Updated: src/api-data/initialContent.json - Remove the tabs array and unused All Roles navigation labels from the initial-content response <Last Updated: 20/11/2026>
 - Updated: ../client/src/views/Home.vue - Request each 20-job page from /jobs-listing without repeating AI processing <Last Updated: 20/11/2026>
