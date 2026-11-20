import express from "express";
const router = express.Router();
import initialContent from "../api-data/initialContent.json"


router.get('/initial-content', (req, res) => {
    res.status(200).send(initialContent);
});

export default router;