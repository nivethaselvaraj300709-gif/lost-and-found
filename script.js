
const STORAGE_KEY = "findit-listings-v1";

const sampleItems = [
    {
        id: "1",
        type: "lost",
        category: "Electronics",
        name: "Wireless Earbuds Case",
        location: "College Library",
        description: "Small white charging case.",
        date: "2026-11-18"
    },
    {
        id: "2",
        type: "found",
        category: "Books & Stationery",
        name: "Blue Notebook",
        location: "Main Auditorium",
        description: "Blue notebook found after class.",
        date: "2026-11-19"
    },
    {
        id: "3",
        type: "lost",
        category: "Accessories",
        name: "Silver Keychain",
        location: "College Cafeteria",
        description: "Small silver keychain with two keys.",
        date: "2026-11-20"
    }
];

const itemGrid = document.getElementById("itemGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const itemForm = document.getElementById("itemForm");

let items = loadItems();
let activeFilter = "all";

// LOAD SAVED ITEMS

function loadItems() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : sampleItems;
    } catch {
        return sampleItems;
    }
}

// SAVE ITEMS

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// PREVENT HTML INJECTION

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// CATEGORY ICONS

function getIcon(category) {
    const icons = {
        "Electronics": "⌁",
        "Accessories": "✧",
        "Books & Stationery": "▤",
        "Clothing": "◇",
        "Keys & Cards": "⚿",
        "Other": "✦"
    };

    return icons[category] || "✦";
}

// DISPLAY DATE

function formatDate(date) {
    if (!date) return "Date not provided";

    const value = new Date(date + "T00:00:00");

    if (Number.isNaN(value.getTime())) {
        return "Date not provided";
    }

    return value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// DISPLAY ITEMS

function displayItems() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredItems = items.filter(item => {
        const matchesType =
            activeFilter === "all" ||
            item.type === activeFilter;

        const searchableText = [
            item.name,
            item.location,
            item.description,
            item.category
        ].join(" ").toLowerCase();

        return matchesType && searchableText.includes(searchText);
    });

    itemGrid.innerHTML = filteredItems.map(item => `
        <div class="item-card">

            <div class="card-top">
                <span class="category-icon">
                    ${getIcon(escapeHTML(item.category))}
                </span>

                <span class="status ${escapeHTML(item.type)}">
                    ${item.type === "lost" ? "LOST" : "FOUND"}
                </span>
            </div>

            <h3>${escapeHTML(item.name)}</h3>

            <p>${escapeHTML(item.description || "No description provided.")}</p>

            <p>📍 ${escapeHTML(item.location)}</p>

            <p>📂 ${escapeHTML(item.category)}</p>

            <div class="item-date">
                REPORTED ${escapeHTML(formatDate(item.date))}
            </div>

        </div>
    `).join("");

    resultCount.textContent =
        `${filteredItems.length} item(s) found`;

    emptyState.hidden = filteredItems.length > 0;
}

// FILTER BUTTONS

document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => {

        activeFilter = button.dataset.filter;

        document.querySelectorAll(".filter-button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        displayItems();
    });
});

// SEARCH ITEMS

searchInput.addEventListener("input", displayItems);

// SUBMIT FORM

itemForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newItem = {
        id: Date.now().toString(),

        type: document.getElementById("itemType").value,

        category: document.getElementById("itemCategory").value,

        name: document.getElementById("itemName").value.trim(),

        location: document.getElementById("itemLocation").value.trim(),

        description: document.getElementById("itemDescription").value.trim(),

        date: document.getElementById("itemDate").value,

        reporter: document.getElementById("reporterName").value.trim()
    };

    if (!newItem.name || !newItem.location || !newItem.date) {
        document.getElementById("formMessage").textContent =
            "Please fill in all required fields.";
        return;
    }

    items.unshift(newItem);

    try {
        saveItems();
    } catch (error) {
        items.shift();

        document.getElementById("formMessage").textContent =
            "Unable to save listing in this browser.";

        return;
    }

    itemForm.reset();

    activeFilter = "all";
    searchInput.value = "";

    document.querySelectorAll(".filter-button")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === "all"
            );
        });

    displayItems();

    document.getElementById("formMessage").textContent =
        "Your item has been successfully published!";

    document.getElementById("browse").scrollIntoView({
        behavior: "smooth"
    });
});

// SET CURRENT DATE

document.getElementById("itemDate").value =
    new Date().toISOString().slice(0, 10);

// FOOTER YEAR

document.getElementById("year").textContent =
    new Date().getFullYear();

// INITIAL DISPLAY

displayItems();
