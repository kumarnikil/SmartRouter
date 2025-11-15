importScripts('logic/recommendation.js');

const CATEGORY_HISTORY_KEY = "CATEGORY_HISTORY_KEY"
let categoryHistory = {};

// TODO: Cleanliness - manage into seperate Tab Object
let recTabId = null;
let recTabUrl = null;
let altTabId = null;
let altTabUrl = null;

// TODO: Cleanliness - manage global record of query, category, recommendation
let tabCategory = null;

// TODO: Controllable by the GUI
let closeTimerMs = 7000;  // fallback default, 7s
let closeTimers = {};     // tabId to timerId

// *** CHROME EVENTS HANDLING *** //s

// on startup event
chrome.runtime.onStartup.addListener(() => {
    log("🚀 startup event triggered");
    loadCategoryHistory();
});

// on extension installed / uploaded event (for dev-only)
chrome.runtime.onInstalled.addListener(() => {
    log("🧩 extension installed or updated");
    loadCategoryHistory();
});

// on query entered 
chrome.tabs.onUpdated.addListener((_, changeInfo, currTab) => {
    if (changeInfo.status !== "loading") return;
    if (!currTab.url) return;

    try {
        const plexUrl = new URL(currTab.url);
        if (!plexUrl.hostname.includes("perplexity.ai")) return;
        if (!plexUrl.searchParams.has("q")) return;
        const query = plexUrl.searchParams.get("q");

        // get recommendation, for tab main or background placement 
        const [category, rec] = getAndLogRecommendation(query, categoryHistory);
        tabCategory = category;
        const isRecGoogle = rec === "g";

        const googUrlString = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        const googUrl = new URL(googUrlString);

        chrome.tabs.create({
            url: googUrlString,
            active: isRecGoogle

        }).then((googTab) => {
            if (isRecGoogle) {
                // TODO: Cleanliness - manage into seperate Tab Object
                recTabId = googTab.id;
                recTabUrl = googUrl;
                altTabId = currTab.id;
                altTabUrl = plexUrl;

            } else {
                recTabId = currTab.id;
                recTabUrl = plexUrl;
                altTabId = googTab.id;
                altTabUrl = googUrl;
            }
            cancelAndScheduleClose(recTabId, altTabId);
        });

    } catch (e) {
        console.error("Error handling tab update:", e);
    }
});


// log whenever the user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        const activeTabId = getTabId(activeTab);

        if (recTabId !== activeTabId && altTabId !== activeTabId) return;
        log(`User switched to managed tab ${activeTab.id}: ${activeTab.title} (${activeTab.url})`);

        if (activeTabId === recTabId) {
            cancelAndScheduleClose(recTabId, altTabId);
        }
        else if (activeTabId === altTabId) {
            cancelAndScheduleClose(altTabId, recTabId);
        }

    } catch (e) {
        console.error("Error getting active tab info:", e);
    }
});

// listen for tab closures and clear state/timers if it's one of ours
chrome.tabs.onRemoved.addListener((closedTabId, _) => {
    if (closedTabId === recTabId) {
        handleFinalRecommendation(altTabId, altTabUrl, false); // recommended tab closed

    } else if (closedTabId === altTabId) {
        handleFinalRecommendation(recTabId, recTabUrl, true);

    } else {
        log(`Unrelated tab closed: ${closedTabId}`);
    }
    resetTabs();
});

// *** *** //

// *** UTILITY METHODS *** //

function cancelAndScheduleClose(cancelCloseTabId, scheduleCloseTabId) {
    cancelClose(cancelCloseTabId);
    if (scheduleCloseTabId) scheduleClose(scheduleCloseTabId, closeTimerMs);
}

function cancelClose(tabId) {
    if (closeTimers[tabId]) {
        clearTimeout(closeTimers[tabId]); // BUGTODO: find out why this isn't working well.
        delete closeTimers[tabId];
    }
}

function scheduleClose(tabId, delayMs) {
    // cancel any existing timer first
    cancelClose(tabId);

    closeTimers[tabId] = setTimeout(() => {
        chrome.tabs.remove(tabId, () => {
            if (chrome.runtime.lastError) {
                console.warn(`Could not close tab ${tabId}:`, chrome.runtime.lastError.message);
            } 
        });
        delete closeTimers[tabId];
    }, delayMs);
}

function handleUserChoice(category, sd) {
    if (!categoryHistory[category]) {
        categoryHistory[category] = { g: 0, p: 0 };
    }
    categoryHistory[category][sd] += 1;
}

function loadCategoryHistory() {
    try {
        chrome.storage.local.get([CATEGORY_HISTORY_KEY]).then((data) => {
            if (data.CATEGORY_HISTORY_KEY) {
                categoryHistory = data.CATEGORY_HISTORY_KEY;
                log("✅ Category history loaded from storage:", JSON.stringify(categoryHistory));

            } else {
                categoryHistory = {};
                log("❌ No existing category history found. Starting fresh.");
            }
        });

    } catch (err) {
        console.error("Failed to load category history:", err);
        categoryHistory = {};
    }
}

// save category history on shutdown
function saveCategoryHistory() {
    chrome.storage.local.set({ CATEGORY_HISTORY_KEY: categoryHistory }, () => {
        console.log("💾 Category history saved:", JSON.stringify(categoryHistory));
    });
}

// *** *** //

// *** HELPER METHODS *** //
function logTabContext(tab, label) {
    if (!tab) {
        log(label + ": <null>");
        return;
    }
    let hostname = '';
    try {
        if (tab.url) hostname = new URL(tab.url).hostname;
    } catch (_) { }
    log(label + `: id=${tab.id}, url=${tab.url || '<empty>'}, hostname=${hostname}, title=${tab.title || ''}`);
}

function log(msg) {
    console.log(msg);
}

function handleFinalRecommendation(chosenTabId, chosenTabUrl, isRecTab) {
    try {
        const url = new URL(chosenTabUrl);
        const hostname = url.hostname;
        const query = url.searchParams.get('q') || '';

        // Determine engine and emoji
        let engine, emoji;
        if (hostname.includes('google.')) {
            engine = 'Google';
            emoji = '🔍';
            handleUserChoice(tabCategory, 'g');

        } else if (hostname.includes('perplexity.ai')) {
            engine = 'Perplexity';
            emoji = '🤖';
            handleUserChoice(tabCategory, 'p');

        } else {
            engine = hostname;
            emoji = '🌐';
        }

        const choiceType = isRecTab ? 'RECOMMENDED' : 'ALTERNATIVE';
        log(`RESULT: 🎯 User chose ${emoji} ${engine} (${choiceType}) for "${query}" (Tab ${chosenTabId}) - ${new Date().toLocaleTimeString()} with Updated History ${JSON.stringify(categoryHistory)}`);

        // save category history to chrome storage
        saveCategoryHistory();
        
    } catch (e) {
        log(`RESULT: 🎯 User chose tab ${chosenTabId}, but failed to parse URL: ${chosenTabUrl}`);
    }
}

function getTabId(tab) {
    if (tab == null) return null;
    return tab.id;
}

function resetTabs() {
    recTabId = null;
    recTabUrl = null;
    altTabId = null;
    altTabUrl = null;
    tabCategory = null;
}