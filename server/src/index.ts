import express from "express";
const app = express();
import dotenv from "dotenv";
import expressSession from "express-session";
import { initialContent } from "../src/route"
import jobListing from "./route/jobListing.ts";
import { startJobCheckAutoRefresh } from "./controllers/jobCheckAI.ts";
import { mongoDBConnection } from "../../database";

const { startServer, store } = await mongoDBConnection();

dotenv.config();

app.disable('x-powered-by'); // This will remove the X-Powered-By header, which can help to prevent attackers from identifying the server software being used.

const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET || "";

await startServer();
void startJobCheckAutoRefresh();

const session = expressSession({
    secret: sessionSecret,
    store: store as unknown as expressSession.Store,
    resave: false,
    saveUninitialized: false,

});

const sessionStore = store as unknown as expressSession.Store & {
    on?: (event: string, callback: (error: unknown) => void) => void;
};

sessionStore.on?.('error', (error) => {
    console.error('Session store error:', error);
});

app.use(session);
app.use(express.json()); // Middleware to parse json
app.use(express.urlencoded());

app.use((req, res, next) => {
    // You can set security headers according to your app.
    // Make sure there are no other projects running with same origins backend or frontend. Every project should have unique origins.
    // You can update your origins according to your app.

    const origin = req.headers.origin || 'http://localhost:5173';
    const clientURL = process.env.CLIENT_URL || 'https://fresher-friend-client.onrender.com';
    const serverURL = process.env.SERVER_URL || 'https://fresher-friend-server.onrender.com';
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://himalayas.app',
        clientURL,
        serverURL
    ];
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.sendStatus(204);
    }
    
    next();
})

app.use('/fresherFriend', initialContent)
app.use('/fresherFriend', jobListing);

app.listen(port, () => {
    console.log(`The connection is running on port ${port}`)
})