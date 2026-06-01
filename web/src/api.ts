export const API_URL = import.meta.env.VITE_API_URL || "https://trialvault-aa9g.onrender.com";

export type CohortRequestPayload = {
  criteriaHash: string;
  condition: string;
  minAge: number;
  maxAge: number;
  requester?: string;
  encryptedPayload?: Record<string, unknown>;
};

export async function logCohortRequest(payload: CohortRequestPayload) {
  const response = await fetch(`${API_URL}/cohort-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to log cohort request");
  }

  return response.json();
}
