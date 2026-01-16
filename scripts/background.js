import { GmailAPI } from "./gmail-api.js";
import { OpenRouterAPI } from "./openrouter-api.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_jobs") {
    handleSync(sendResponse);
    return true; // Keeps the message channel open for async response
  }
});

async function handleSync(sendResponse) {
  try {
    // 1. Get Settings (API Key)
    const settings = await chrome.storage.local.get(["openrouter_key", "jobs"]);
    if (!settings.openrouter_key) {
      sendResponse({ status: "error", message: "Missing OpenRouter API Key" });
      return;
    }

    // 2. Authenticate Gmail
    const token = await GmailAPI.getAuthToken();

    // 3. List relevant messages as Gmail already filters them
    const messages = await GmailAPI.listMessages(token);
    const existingJobs = settings.jobs || []; //Prevent duplicates
    const newJobs = [];

    // 4. Process each message
    for (const msg of messages) {
      // Check if we already processed this email ID to save API quota
      if (existingJobs.find((job) => job.id === msg.id)) continue;

      const fullEmail = await GmailAPI.getMessage(token, msg.id);
      const analysis = await OpenRouterAPI.analyzeEmail(
        settings.openrouter_key,
        fullEmail
      );

      if (analysis.is_job_related) {
        newJobs.push({ ...analysis, id: msg.id });
      }
    }

    // 5. Update Storage
    const updatedJobs = [...newJobs, ...existingJobs];
    await chrome.storage.local.set({ jobs: updatedJobs });

    sendResponse({ status: "success", count: newJobs.length });
  } catch (error) {
    console.error("Sync Error:", error);
    sendResponse({ status: "error", message: error.message });
  }
}
