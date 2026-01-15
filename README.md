# AI Job Application Tracker 🚀
      - Maintained by Poushali Patra
A Chrome Extension that automatically syncs job application emails from your Gmail, analyzes them using **Gemini 2.5 Flash**, and organizes them into a clean dashboard with interview tracking.

## 🌟 Features
- **Gmail Sync**: One-click retrieval of job-related emails.
- **AI Analysis**: Extracts Company, Role, Status, and Interview dates automatically.
- **Job Dashboard**: Sort, filter, and manage your applications in a full-page view.
- **Interview Tracking**: Highlights upcoming interviews with date/time extraction.
- **Export**: Download your entire job search history as a CSV.

---

## 🛠️ Setup Instructions

Follow these steps to get the extension running on your local machine.

### 1. Load the Extension into Chrome
1. Download or clone this repository to your computer.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the folder containing this project.
5. **Important:** Copy the **Extension ID** (a long string of random letters) that appears on the extension card. You will need this for the next step.

### 2. Configure Google Cloud (OAuth 2.0)
To allow the extension to read your emails and add to your calendar, you must register it in the Google Cloud Console.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** (e.g., "My Job Tracker").
3. Navigate to **APIs & Services > Library** and enable:
   - **Gmail API**
   - **Google Calendar API**
4. Navigate to **OAuth consent screen**:
   - Choose **External**.
   - Fill in the required app information.
   - **Scopes**: Add `https://www.googleapis.com/auth/gmail.readonly` and `https://www.googleapis.com/auth/calendar.events`.
   - **Test Users**: Add your own Gmail address (crucial for testing).
5. Navigate to **Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Select **Chrome extension** as the application type.
   - In the **Item ID** field, paste the **Extension ID** you copied from Chrome earlier.
   - Click **Create** and copy your new **Client ID**.

### 3. Update the Code
1. Open the project folder in your code editor.
2. Open `manifest.json`.
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with the Client ID you just created.
4. Return to `chrome://extensions` and click the **Reload** icon on the extension card.

### 4. Get a Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and create a new key.
3. Open the Extension Popup in Chrome, go to **Settings**, paste the key, and click **Save**.

---

## 🚀 How to Use
1. **Sync**: Click the "Sync Gmail" button in the popup.
2. **Authorize**: A Google login window will appear. Select your account and click **Allow** (you may need to click "Advanced > Go to App" if it says unverified).
3. **View**: Click "Full Dashboard" to see your tracked jobs.
4. **Test**: Send an email to yourself with a subject like "Interview Invitation" to see the AI extract the date and time!

---

## 📁 Project Structure
- `manifest.json`: Extension configuration and permissions.
- `scripts/`: Logic for Gmail, Gemini API, and background processes.
- `dashboard/`: HTML/CSS/JS for the main user interface.
- `popup/`: The small menu that appears when clicking the extension icon.

## 📜 License
MIT License - feel free to use and modify for your own job search!