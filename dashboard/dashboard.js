document.addEventListener('DOMContentLoaded', () => {
    loadAndRender('all');

    // Handle Filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            loadAndRender(e.target.dataset.filter);
        });
    });

    document.getElementById('refresh-dashboard').addEventListener('click', () => location.reload());
});
// Handle Open Email Button Clicks
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("open-email-btn")) {
        const id = e.target.dataset.id;
        const gmailUrl = `https://mail.google.com/mail/u/0/#all/${id}`;
        window.open(gmailUrl, "_blank");
    }
});


async function loadAndRender(filter) {
    const data = await chrome.storage.local.get('jobs');
    const jobs = data.jobs || [];
    const tbody = document.getElementById('dashboard-table-body');

    // 1. Filter the list based on sidebar selection
    let filteredJobs = filter === 'all'
        ? jobs
        : jobs.filter(j => j.status === filter);

    // 2. Sort: Put "Interviewing" status at the top, then sort by date
    filteredJobs.sort((a, b) => {
        if (a.status === 'Interviewing' && b.status !== 'Interviewing') return -1;
        if (a.status !== 'Interviewing' && b.status === 'Interviewing') return 1;
        return new Date(b.date) - new Date(a.date);
    });

    document.getElementById('total-count').innerText = filteredJobs.length;

    // 3. Render the rows
    tbody.innerHTML = filteredJobs.map(job => {
        // 1. Check if it's an interview to decide on the highlight
        const isInterview = job.status === 'Interviewing';

        // 2. Define the Bolt Icon using Unicode escape (FAIL-PROOF)
        const boltIcon = isInterview ? ' <span class="interview-icon">\u26A1</span>' : '';

        // 3. Define the Calendar Icon and Info using Unicode escape
        const interviewInfo = job.interview_details?.is_scheduled
            ? `<br><small>\uD83D\uDCC5 ${job.interview_details.date} at ${job.interview_details.time}</small>`
            : '';

        // 4. Return the complete row HTML
        return `
      <tr class="${isInterview ? 'row-highlight' : ''}">
        <td>${job.date}</td>
        <td>
            <strong>${job.company}</strong>
            ${boltIcon}
        </td>
        <td>
            ${job.role}
            ${interviewInfo}
        </td>
        <td><span class="status-pill status-${job.status}">${job.status}</span></td>
        <td>
  <button class="open-email-btn" data-id="${job.id}">Open Email</button>
  <button class="delete-btn" onclick="deleteJob('${job.id}')">Remove</button>
</td>

      </tr>
    `;
    }).join('');
}

// Attach to window so onclick works
window.deleteJob = async (id) => {
    const data = await chrome.storage.local.get('jobs');
    const updated = data.jobs.filter(j => j.id !== id);
    await chrome.storage.local.set({ jobs: updated });
    location.reload();
};





document.getElementById('export-csv').addEventListener('click', async () => {
    const result = await chrome.storage.local.get('jobs');
    const jobs = result.jobs || [];

    if (jobs.length === 0) {
        alert("No data to export!");
        return;
    }

    // 1. Define CSV headers
    const headers = ["Date", "Company", "Role", "Status", "Interview Date", "Interview Time"];

    // 2. Map data to rows
    const rows = jobs.map(job => [
        job.date,
        `"${job.company}"`, // Quotes handle commas in company names
        `"${job.role}"`,
        job.status,
        job.interview_details?.date || "",
        job.interview_details?.time || ""
    ]);

    // 3. Construct CSV string
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    // 4. Create a download link and click it automatically
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});