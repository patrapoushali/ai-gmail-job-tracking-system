/**
 * Gmail API Handler
 * Handles authentication and fetching of emails
 */

export const GmailAPI = {
  /**
   * Gets the OAuth2 token from Chrome Identity API
   */
  getAuthToken: function() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });
  },

  /**
   * Searches for relevant job emails
   * Filter: Emails from last 7 days containing "application" or "thank you"
   */
 listMessages: async function(
  token,
  query = `
label:INBOX
newer_than:7d
(
  internship OR intern OR
  job OR role OR position OR opening OR opportunity OR
  application OR applied OR applicant OR candidature OR
  interview OR shortlisted OR screening OR assessment OR test OR coding OR OA OR
  offer OR hired OR selected OR rejected OR declined OR
  recruiter OR HR OR hiring OR talent OR careers OR
  "thank you for applying" OR
  "application received" OR
  "application status" OR
  "shortlisted" OR
  "move forward" OR
  "next steps" OR
  "technical interview" OR
  "coding challenge" OR
  "online assessment"
)
`
)
 {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data.messages || [];
  },

  /**
   * Fetches the full content of a specific email
   */
  getMessage: async function(token, messageId) {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    
    // Simple helper to decode base64 email body
    const part = data.payload.parts ? data.payload.parts[0] : data.payload;
    const body = part.body.data 
      ? atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')) 
      : "";
      
    return {
      id: data.id,
      snippet: data.snippet,
      body: body,
      subject: data.payload.headers.find(h => h.name === "Subject")?.value
    };
  }
};