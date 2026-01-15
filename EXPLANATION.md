# 🧠 Technical Logic & Architecture

This document breaks down the internal mechanics of the **AI Job Tracker**, explaining how it bridges Gmail, Gemini AI, and the Chrome Extension API.

## 📡 System Architecture
The extension follows a **Service-Oriented Architecture** within a Manifest V3 environment:
1.  **Storage Layer**: Uses `chrome.storage.local` to persist the job database and API keys.
2.  **API Layer**: Two specialized modules (`gmail-api.js` and `gemini-api.js`) handle external communications.
3.  **Background Service**: The Service Worker (`background.js`) acts as the "brain," coordinating data flow between APIs and storage.

---

## 📩 Step 1: Gmail Data Retrieval (`gmail-api.js`)
The extension uses the **OAuth 2.0** protocol to access the user's emails securely.

-   **Authentication**: `chrome.identity.getAuthToken` retrieves a temporary bearer token from the Google account signed into Chrome.
-   **Filtering**: To optimize performance, we use a specific Gmail search query:
    -   Query: `newer_than:7d (application OR "thank you for applying" OR interview)`
-   **Decoding**: Gmail returns email bodies in **Base64URL** format. The script converts this into standard text so the AI can process the content.

---

## 🤖 Step 2: AI Analysis (`gemini-api.js`)
This module transforms raw email text into structured data using **Gemini 2.5 Flash**.

### The Prompting Strategy
We use **Structured Prompting** to ensure the AI returns data that our dashboard can read. We provide:
1.  **Context**: "You are a career assistant."
2.  **Input**: The Subject and Body of the email.
3.  **Dynamic Reference**: We pass `Today's Date` so the AI can resolve relative dates (e.g., "next Tuesday").
4.  **Schema**: 
    ```json
    {
      "is_job_related": boolean,
      "company": "string",
      "status": "Applied" | "Interviewing" | "Rejected",
      "interview_details": { "is_scheduled": boolean, "date": "...", "time": "..." }
    }
    ```

### Safety & Parsing
Because AI sometimes includes conversational text or markdown backticks (e.g., \` \` \`json), the script uses a **Regular Expression** (`/\{[\s\S]*\}/`) to surgically extract the JSON object before parsing it into the database.

---

## 📊 Step 3: The Dashboard Logic (`dashboard.js`)
The dashboard is a dynamic data view built with vanilla JavaScript.

-   **Duplicate Prevention**: Before adding a job, the background script checks the unique `msg.id` from Gmail. This ensures that syncing multiple times doesn't create duplicate entries.
-   **Interview Logic**:
    -   If `status === "Interviewing"`, the row is assigned a `.row-highlight` class.
    -   **Unicode Escapes**: To avoid character encoding issues (garbled text), we use Unicode sequences (`\u26A1` for ⚡ and `\uD83D\uDCC5` for 📅).
-   **Sorting**: Jobs are sorted by priority:
    1.  "Interviewing" status is pinned to the top.
    2.  All other jobs are sorted by date (newest first).

---

## 🔐 Security & Privacy
-   **Least Privilege**: The extension requests `gmail.readonly`—it can read your mail but cannot send, delete, or change it.
-   **Local Storage**: Your job data never leaves your computer. It is stored in your local Chrome profile and only sent to Google’s APIs (Gmail/Gemini) during the sync process.
-   **No Backend**: There is no external database; you own 100% of your data.

---

## 🛠️ Key Technologies
-   **Manifest V3**: The latest, most secure Chrome Extension standard.
-   **Gemini 2.5 Flash**: A high-speed, low-latency AI model optimized for text extraction.
-   **OAuth 2.0**: Standardized secure authorization without password sharing.