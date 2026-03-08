// ==============================
// Variables & DOM Elements
// ==============================
const allBtn = document.querySelectorAll(".btn"); // Status buttons: All / Open / Closed
let allIssues = []; // সমস্ত issues এখানে সংরক্ষণ হবে
let searchInput = document.querySelector("input[type='search']"); // Search input
let searchBtn = document.querySelector(".btn.join-item"); // Search button
const issueCountSpan = document.querySelector("div p span"); // Issue count span

// ==============================
// Fetch API: Load all issues
// ==============================
fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
  .then(res => res.json())
  .then(data => {
    allIssues = data.data;

    // Assign each issue to a button based on status
    allIssues.forEach(issue => {
      if (issue.status?.toUpperCase() === "CLOSED") {
        issue.button = "closed";
      } else if (issue.status?.toUpperCase() === "OPEN") {
        issue.button = "open";
      } else {
        issue.button = "all";
      }
    });

    // Initial render
    renderIssues(allIssues);
  });

// ==============================
// Render issues with count update
// ==============================
function renderIssues(issues) {
  showCards(issues);
  updateIssueCount(issues.length);
}

// ==============================
// Update Issue Count
// ==============================
function updateIssueCount(count) {
  issueCountSpan.innerText = count;
}

// ==============================
// Filter & Search Logic
// ==============================
function getFilteredIssues() {
  let filtered = [...allIssues];

  // 1. Status button filter
  const activeBtn = document.querySelector(".btn.active");
  if (activeBtn) {
    const btnText = activeBtn.innerText.toLowerCase();
    if (btnText === "open") {
      filtered = filtered.filter(issue => issue.status?.toUpperCase() === "OPEN");
    } else if (btnText === "closed") {
      filtered = filtered.filter(issue => issue.status?.toUpperCase() === "CLOSED").slice(0, 4);
    }
  }

  // 2. Search filter
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(issue =>
      (issue.id && issue.id.toString().includes(searchTerm)) ||
      (issue.title && issue.title.toLowerCase().includes(searchTerm)) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm)) ||
      (issue.status && issue.status.toLowerCase().includes(searchTerm))
    );
  }

  return filtered;
}

// ==============================
// Status Buttons Click
// ==============================
allBtn.forEach(btn => {
  btn.addEventListener("click", function () {
    allBtn.forEach(b => b.classList.remove("active"));
    this.classList.add("active");

    const filtered = getFilteredIssues();
    renderIssues(filtered);
  });
});

// ==============================
// Search Button Click
// ==============================
searchBtn.addEventListener("click", function () {
  const filtered = getFilteredIssues();
  renderIssues(filtered);
});

// ==============================
// Show Cards Function
// ==============================
function showCards(issues) {
  const container = document.getElementById("card-container");
  container.innerHTML = ""; // Clear previous cards

  issues.forEach(issue => {

    // ------------------------------
    // Border Top Color Based on Status
    // ------------------------------
    // Closed → Purple, Open → Green
    const borderTopColor = issue.status?.toUpperCase() === "CLOSED"
      ? "border-t-4 border-purple-500"
      : "border-t-4 border-green-500";

    // Priority background color
    const priorityBg = (issue.priority?.toUpperCase() === "LOW")
      ? "bg-gray-300"
      : "bg-red-300";

    // Enhancement or Bug / Help Wanted Labels
    let enhancementContent = "";
    if (Array.isArray(issue.labels) && issue.labels.some(label => label.toLowerCase() === "enhancement")) {
      enhancementContent = `<p class="bg-[#0ded9f2e] text-green-500 rounded-2xl w-40 mx-auto px-5 text-sm mt-2">ENHANCEMENT</p>`;
    } else {
      enhancementContent = `
        <div class="flex justify-between items-center px-6 pt-4">
          <p class="text-sm bg-[#ef44446b] text-red-400 px-5 rounded-md">Bug</p>
          <p class="text-sm px-2 rounded-md bg-[#d977063b] text-[#D97706]">help wanted</p>
        </div>
      `;
    }

    // Format Created Date
    const createdDate = issue.createdAt
      ? new Date(issue.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "";

    // Create Card HTML
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="border p-4 rounded-lg shadow-md bg-white ${borderTopColor}">
          <div class="flex justify-between mb-2">
              <img src="./assets/Open-Status.png" alt="" class="w-6 h-6"/>
              <p class="rounded-2xl px-4 ${priorityBg}">
                  ${issue.priority || ""}
              </p>
          </div>

          <h2 class="text-lg font-bold">${issue.title || ""}</h2>

          <p class="text-gray-500 mt-2">
              ${issue.description || ""}
          </p>

          ${enhancementContent}

          <div class="mt-3 flex gap-2 flex-wrap">
              <span class="bg-red-200 px-2 py-1 rounded text-sm">
                  ${issue.type || ""}
              </span>
          </div>

          <p class="text-sm mt-3 text-gray-400">
              #${issue.id || ""} by ${issue.author || ""} | ${issue.date || ""}
          </p>

          <p class="text-xs mt-1 text-gray-400">
              Created At: ${createdDate}
          </p>
      </div>
    `;

    container.appendChild(div);
  });
}