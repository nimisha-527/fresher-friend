import type { HimalayasJob } from "../types/jobListing";

// Helper to format raw Himalayas salary into "2.4 LPA"
export function formatSalaryLPA(
  amount: number | undefined,
  currency: string | undefined,
): string {
  if (!amount) return "Not Disclosed";
  if (currency === "INR") {
    const lpa = (amount / 100000).toFixed(1).replace(/\.0$/, "");
    return `${lpa} LPA`;
  }
  return `${currency || "$"} ${amount.toLocaleString()}`;
}

// Strip HTML tags from Himalayas description
export function cleanDescription(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000);
}

export function deduplicateHimalayasJobs(
  jobs: HimalayasJob[],
): HimalayasJob[] {
  const seen = new Set<string>();

  return jobs.filter((job) => {
    const guid = job.guid?.trim().toLowerCase();
    const title = job.title.trim().toLowerCase();
    const companyName = job.companyName?.trim().toLowerCase();

    if (!guid || !title || !companyName) {
      return true;
    }

    const key = JSON.stringify([guid, title, companyName]);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function resolveRoleType(
  job: any,
): "Internship" | "Fresher" | "Full-Time" | "Contract" {
  const empType = String(job.employmentType || "").toLowerCase();
  const title = String(job.title || "").toLowerCase();
  const seniorityList = Array.isArray(job.seniority)
    ? job.seniority.map((s: string) => s.toLowerCase())
    : [];

  // 1. Check Intern first
  if (
    empType === "intern" ||
    empType.includes("intern") ||
    /\bintern(ship)?\b/.test(title)
  ) {
    return "Internship";
  }

  // 2. If not Intern and seniority includes Entry-level -> Fresher
  if (seniorityList.includes("entry-level")) {
    return "Fresher";
  }

  // 3. Fallback for Contract vs Full-Time
  if (empType.includes("contract")) {
    return "Contract";
  }

  return "Full-Time";
}

// Helper to catch "3 to 5 years", "3-5 yrs", "2+ years", "min 3 years", etc.
export function requiresMultiYearExperience(text = ""): boolean {
  const plainText = text.replace(/<[^>]*>/g, " ");
  // Matches ranges starting at 2+ (e.g. "2-4 yrs", "3 to 5 years") or "2+ years" / "minimum 3 years"
  return (
    /\b([2-9]|\d{2,})\s*(?:\+|to|-|–)\s*\d*\s*(?:years?|yrs?)\b/i.test(
      plainText,
    ) ||
    /\b(?:minimum|min\.?|at least)\s*([2-9]|\d{2,})\s*(?:years?|yrs?)\b/i.test(
      plainText,
    )
  );
}
