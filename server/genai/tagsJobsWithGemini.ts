import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models to try in order if one experiences a 503 high-demand spike
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

interface SlimJob {
  id: string;
  title: string;
  employmentType: string;
  seniority: string[];
  rawLocation: string;
  excerpt: string;
}

export interface TokenUsage {
  inputTokens: number | null;
  outputTokens: number | null;
}

export interface TaggedJobsBatch {
  jobs: unknown;
  tokenUsage: TokenUsage;
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function tagJobsBatch(
  slimJobs: SlimJob[],
): Promise<TaggedJobsBatch> {
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "Exact job ID passed in input.",
        },
        location: {
          type: Type.STRING,
          enum: [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Delhi NCR",
            "Mumbai",
            "Chennai",
            "Kolkata",
            "Remote India",
            "Other",
          ],
          description:
            "Normalized Indian city. Map Bengaluru->Bangalore, Gurgaon/Noida->Delhi NCR.",
        },
        workMode: {
          type: Type.STRING,
          enum: ["Remote", "Hybrid", "On-Site"],
          description: "Work arrangement inferred from location/description.",
        },
        roleType: {
          type: Type.STRING,
          enum: ["Internship", "Fresher", "Full-Time", "Contract"],
          description: "Role type classified from title, employment type, and seniority.",
        },
        skills: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        isFresherEligible: {
          type: Type.BOOLEAN,
          description: "False if description requires > 2 years experience; otherwise true.",
        },
      },
      required: [
        "id",
        "location",
        "workMode",
        "roleType",
        "skills",
        "isFresherEligible",
      ],
    },
  };

  const systemInstruction = `You are an expert Indian tech and campus recruitment agent.
Classify EVERY job object in the input list using the exact allowed enum values. Do NOT skip or remove any job from the output array.

Rules:
1. id: Return the exact same "id" string from the input object.
2. location: Map "Bengaluru" or "BLR" -> "Bangalore". Map "Gurgaon", "Gurugram", "Noida", or "Delhi" -> "Delhi NCR". If rawLocation is 'Other' or 'India', check the description for a specific Indian city or explicit remote work; otherwise keep location as 'Other'. If remote and open to India/APAC/Worldwide -> "Remote India".
3. roleType: Classify using the following rules in order:
   - "Internship" if employmentType is "intern" or contains "intern", or title contains the whole word "intern" or "internship" (case-insensitive).
   - Otherwise "Fresher" if seniority includes "entry-level" (case-insensitive).
   - Otherwise "Contract" if employmentType contains "contract".
   - Otherwise "Full-Time".
4. workMode: Infer "Remote", "Hybrid", or "On-Site" from location and description.
5. isFresherEligible: Set to false ONLY if the description explicitly requires more than 2 years of experience; otherwise true.
6. skills: Extract 3 concise, relevant technical or domain skills from the title/description.

Jobs:
${JSON.stringify(slimJobs)}
`;

  let lastError;

  // Try each model in the fallback chain with retries on 503 / 429
  for (const modelName of MODEL_FALLBACK_CHAIN) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: systemInstruction,
          config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.1,
          },
        });

        if (typeof response.text !== "string") {
          throw new Error("Gemini returned an empty job tagging response.");
        }

        return {
          jobs: JSON.parse(response.text),
          tokenUsage: {
            inputTokens: response.usageMetadata?.promptTokenCount ?? null,
            outputTokens: response.usageMetadata?.candidatesTokenCount ?? null,
          },
        };
      } catch (err) {
        lastError = err;
        const status =
          err &&
          typeof err === "object" &&
          "status" in err
            ? err.status
            : err &&
                typeof err === "object" &&
                "error" in err &&
                err.error &&
                typeof err.error === "object" &&
                "code" in err.error
              ? err.error.code
              : undefined;
        const isTransient = status === 503 || status === 429;

        if (isTransient) {
          console.warn(
            `[${modelName}] Hit ${status} (attempt ${attempt}/2). Retrying/falling back...`,
          );
          await sleep(1500 * attempt); // Wait 1.5s, then 3s
          continue;
        }

        // If it's a non-transient error (e.g., 400 Invalid API Key), throw immediately
        throw err;
      }
    }
  }

  throw lastError;
}
