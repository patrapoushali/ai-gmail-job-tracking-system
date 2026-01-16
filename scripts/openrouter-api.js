/**
 * OpenRouter API Handler
 * Processes email text to extract job application details
 * Using OpenRouter's unified API for multiple AI models
 */

export const OpenRouterAPI = {
  analyzeEmail: async function (apiKey, emailData) {
    // Using OpenRouter's API endpoint
    const url = "https://openrouter.ai/api/v1/chat/completions";

    // Get today's date so the AI can resolve relative dates like "tomorrow" or "next Friday"
    const today = new Date().toISOString().split("T")[0];

    const prompt = `
          Today's Date: ${today}
          Analyze this email and return a JSON object. 
          
          If this is a job application, confirmation, or interview request, set is_job_related to true.
          If there is an interview mentioned, extract the date/time.

          EMAIL:
          Subject: ${emailData.subject}
          Body: ${emailData.body}

          RETURN ONLY THIS JSON FORMAT:
          {
            "is_job_related": boolean,
            "company": "string",
            "role": "string",
            "status": "Applied" | "Interviewing" | "Rejected" | "Offer",
            "date": "YYYY-MM-DD",
            "interview_details": {
                "is_scheduled": boolean,
                "date": "YYYY-MM-DD or null",
                "time": "HH:MM AM/PM or null"
            }
          }
        `;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": chrome.runtime.getURL(""), // Optional: for rankings
          "X-Title": "AI Job Tracker", // Optional: for rankings
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free", // Using free Gemini model via OpenRouter
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent JSON output
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      // OpenRouter returns the response in data.choices[0].message.content
      let rawText = data.choices[0].message.content;

      // Extract JSON from the response (handles cases where AI adds extra text)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { is_job_related: false };
      }
    } catch (error) {
      console.error("OpenRouter Error:", error);
      return { is_job_related: false };
    }
  },
};
