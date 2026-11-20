import { startServer, store } from "./connection";

export { JobListingModel } from "./models/jobListing";
export type { JobListing } from "./models/jobListing";
export { JobListingsCacheModel } from "./models/jobListingsCache";
export type { ProcessedJobListing } from "./models/jobListingsCache";

export const mongoDBConnection = async () => {
    return {
        startServer,
        store
    }
};

