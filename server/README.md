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
