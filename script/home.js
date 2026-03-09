
// Buttons
const allButtons = document.querySelectorAll(".btn");

// Search input and button
const searchInput = document.querySelector("input[type='search']");
const searchButton = document.querySelector(".btn.join-item");

// Issue count display
const issueCountSpan = document.querySelector("div p span");

// Container for issue cards
const cardContainer = document.getElementById("card-container");

// Modal elements
const modal = document.getElementById("issue-modal");
const closeModalButton = document.getElementById("close-modal");

const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalAuthor = document.getElementById("modal-author");
const modalAssignee = document.getElementById("modal-assignee");
const modalPriority = document.getElementById("modal-priority");
const modalStatus = document.getElementById("modal-status");
const modalLabels = document.getElementById("modal-labels");

// Store all issues
let allIssues = [];

// Create spinner element in JS
const spinner = document.createElement("div");
spinner.style.cssText = `
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.5);
  z-index: 9999;
  display: none;
`;

// Inner circle for spinner
spinner.innerHTML = `
  <div style="
    border: 4px solid #ccc;
    border-top: 4px solid #3490dc;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
  "></div>
`;

// Spinner animation
const style = document.createElement("style");
style.innerHTML = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
document.body.appendChild(spinner);

// Show / hide functions
function showSpinner() { spinner.style.display = "flex"; }
function hideSpinner() { spinner.style.display = "none"; }

// =====================================
// 3. Load all issues from API
// =====================================

function loadAllIssues() {
  showSpinner();

  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then(res => res.json())
    .then(data => {
      allIssues = data.data;
      renderIssues(allIssues);
    })
    .finally(() => hideSpinner());
}

// Initial load
loadAllIssues();

// =====================================
// 4. Render issues and update count
// =====================================

function renderIssues(issues) {
  displayCards(issues);
  issueCountSpan.innerText = issues.length;
}

// =====================================
// 5. Filter issues by status
// =====================================

function getFilteredIssues() {
  let filtered = [...allIssues];

  const activeButton = document.querySelector(".btn.active");
  if (activeButton) {
    const text = activeButton.innerText.toLowerCase();

    if (text === "open") {
      filtered = filtered.filter(issue => issue.status?.toUpperCase() === "OPEN");
    } else if (text === "closed") {
      filtered = filtered.filter(issue => issue.status?.toUpperCase() === "CLOSED");
    }
  }

  return filtered;
}

// =====================================
// 6. Filter button click
// =====================================

allButtons.forEach(button => {
  button.addEventListener("click", () => {
    allButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    const filtered = getFilteredIssues();
    renderIssues(filtered);
  });
});

// =====================================
// 7. Search functionality
// =====================================

function searchIssues() {
  const query = searchInput.value.trim();

  if (!query) {
    renderIssues(allIssues);
    return;
  }

  showSpinner();
  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`)
    .then(res => res.json())
    .then(data => renderIssues(data.data))
    .finally(() => hideSpinner());
}

searchButton.addEventListener("click", searchIssues);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchIssues();
});

// =====================================
// 8. Open modal for single issue
// =====================================

function openIssueModal(id) {
  showSpinner();

  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
    .then(res => res.json())
    .then(data => {
      const issue = data.data;

      modalTitle.innerText = issue.title;
      modalDesc.innerText = issue.description;
      modalAuthor.innerText = `Opened by ${issue.author || "Unknown"}`;
      modalAssignee.innerText = issue.author || "Unknown";
      modalPriority.innerText = issue.priority || "N/A";

      // Status color
      const status = issue.status?.toUpperCase() || "N/A";
      modalStatus.innerText = status;
      modalStatus.className = status === "OPEN"
        ? "bg-green-200 text-green-700 px-2 py-1 rounded"
        : status === "CLOSED"
          ? "bg-purple-200 text-purple-700 px-2 py-1 rounded"
          : "bg-gray-200 text-gray-700 px-2 py-1 rounded";

      // Labels
      modalLabels.innerHTML = "";
      if (Array.isArray(issue.labels)) {
        issue.labels.forEach(label => {
          const span = document.createElement("span");
          span.style.backgroundColor = label.color || "#e5e7eb";
          span.style.color = label.textColor || "#000";
          span.style.padding = "2px 6px";
          span.style.borderRadius = "4px";
          span.style.fontSize = "12px";
          span.style.marginRight = "4px";
          span.innerText = label.name || label;
          modalLabels.appendChild(span);
        });
      }

      modal.classList.remove("hidden");
    })
    .finally(() => hideSpinner());
}

// =====================================
// 9. Close modal
// =====================================

closeModalButton.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// =====================================
// 10. Display issue cards
// =====================================

function displayCards(issues) {
  cardContainer.innerHTML = "";

  issues.forEach(issue => {
    const borderTopColor = issue.status?.toUpperCase() === "CLOSED"
      ? "border-t-4 border-purple-500"
      : "border-t-4 border-green-500";

    let priorityBg = "bg-gray-300";
    if (issue.priority?.toUpperCase() === "HIGH") priorityBg = "bg-red-300";
    else if (issue.priority?.toUpperCase() === "MEDIUM") priorityBg = "bg-yellow-300";

    // Labels HTML
    let labelsHTML = "";
    if (Array.isArray(issue.labels) && issue.labels.length > 0) {
      labelsHTML = issue.labels.map(labelObj => {
        const name = labelObj.name || labelObj;
        const color = labelObj.color || "#ef44446b";
        const textColor = labelObj.textColor || "#000";
        return `<span class="text-sm px-2 py-1 rounded" style="background-color:${color};color:${textColor}">${name}</span>`;
      }).join("");
    }

    const createdDate = issue.createdAt
      ? new Date(issue.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "";

    const card = document.createElement("div");
    card.innerHTML = `
      <div class="border p-4 rounded-lg shadow-md bg-white cursor-pointer ${borderTopColor}">
        <div class="flex justify-between mb-2">
          <img src="./assets/Open-Status.png" class="w-6 h-6"/>
          <p class="rounded-2xl px-4 ${priorityBg}">${issue.priority || ""}</p>
        </div>
        <h2 class="text-lg font-bold">${issue.title || ""}</h2>
        <p class="text-gray-500 mt-2">${issue.description || ""}</p>
        <div class="mt-2 flex gap-2 flex-wrap">${labelsHTML}</div>
        <p class="text-sm mt-3 text-gray-800">#${issue.id || ""} by ${issue.author || ""}</p>
        <p class="text-xs mt-1 text-gray-400">Created At: ${createdDate}</p>
      </div>
    `;

    // Open modal on click
    card.addEventListener("click", () => openIssueModal(issue.id));

    cardContainer.appendChild(card);
  });
}

