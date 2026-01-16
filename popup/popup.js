// Load data on popup open
document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get(["jobs", "openrouter_key"]);
  if (data.jobs) renderJobs(data.jobs);
  if (data.openrouter_key)
    document.getElementById("api-key").value = data.openrouter_key;
});

// Save API Key
document.getElementById("save-key").addEventListener("click", () => {
  const key = document.getElementById("api-key").value;
  chrome.storage.local.set({ openrouter_key: key }, () =>
    alert("OpenRouter API Key Saved!")
  );
});

// Trigger Sync
document.getElementById("sync-btn").addEventListener("click", () => {
  const btn = document.getElementById("sync-btn");
  btn.innerText = "Syncing...";
  btn.disabled = true;

  chrome.runtime.sendMessage({ action: "sync_jobs" }, (response) => {
    btn.innerText = "Sync Gmail";
    btn.disabled = false;
    if (response.status === "success") {
      location.reload(); // Refresh UI to show new jobs
    } else {
      alert("Error: " + response.message);
    }
  });
});

document.getElementById("open-dashboard").onclick = () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("dashboard/dashboard.html"),
  });
};

function renderJobs(jobs) {
  const container = document.getElementById("job-list");
  document.getElementById("job-count").innerText = jobs.length;
  container.innerHTML = jobs
    .map(
      (job) => `
    <div class="job-card">
      <span class="status-badge">${job.status}</span>
      <h4>${job.company}</h4>
      <p>${job.role}</p>
      <p style="font-size: 10px; color: #999;">${job.date}</p>
    </div>
  `
    )
    .join("");
}
