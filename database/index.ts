import { startServer, store } from "./connection";

export { JobListingModel } from "./models/jobListing";
export type { JobListing } from "./models/jobListing";

export const mongoDBConnection = async () => {
    return {
        startServer,
        store
    }
};

