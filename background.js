importScripts('logic/recommendation.js');

// Global state
let recTab = null;
let altTab = null;
const closeTimerMs = 7000; // 5s
const closeTimers = {}; // tabId to timerId

chrome.tabs.onUpdated.addListener((_, changeInfo, currTab) => {
    if (changeInfo.status !== "loading") return;
    if (!currTab.url) return;

    console.log("checking here tabId " + getTabId(currTab), " and tab.id " + getTabId(currTab));

    try {
        const url = new URL(currTab.url);
        if (!url.hostname.includes("perplexity.ai")) return;
        if (!url.searchParams.has("q")) return;

        const query = url.searchParams.get("q");
        const recommendation = getRecommendation(query);
        const isRecGoogle = recommendation === "g";
        console.log(`Recommendation: ${recommendation} for query "${query}"`);
        chrome.tabs.create({
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            active: isRecGoogle // make foreground Google, if recommended

        }, (newTab) => {
            if (isRecGoogle) {
                recTab = newTab;
                altTab = currTab;

            } else {
                recTab = currTab;
                altTab = newTab;
            }
            cancelAndScheduleClose(recTab, altTab);
        });

    } catch (e) {
        console.error("Error handling tab update:", e);
    }
});


// log whenever the user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        console.log(`User switched to tab ${activeTab.id}: ${activeTab.title} (${activeTab.url})`);

        const activeTabId = getTabId(activeTab);
        const recTabId = getTabId(recTab);
        const altTabId = getTabId(altTab);

        if (recTabId !== activeTabId && altTabId !== activeTabId) return;
        console.log("tabId switched to is one of ours!");

        if (activeTabId === recTabId) {
            cancelAndScheduleClose(recTab, altTab);
        }
        else if (activeTabId === altTabId) {
            cancelAndScheduleClose(altTab, recTab);
        }

    } catch (e) {
        console.error("Error getting active tab info:", e);
    }
});

// listen for tab closures and clear state/timers if it's one of ours
chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
    const recTabId = getTabId(recTab);
    const altTabId = getTabId(altTab);

    if (closedTabId === recTabId) {
        console.log(`🧹 Recommended tab closed: ${closedTabId}`);
        recTab = null;
    } else if (closedTabId === altTabId) {
        console.log(`🧹 Alternative tab closed: ${closedTabId}`);
        altTab = null;
    } else {
        console.log(`Unrelated tab closed: ${closedTabId}`);
    }
});

// utility functions
function cancelAndScheduleClose(cancelCloseTab, scheduleCloseTab) {
    cancelClose(cancelCloseTab);
    if (scheduleCloseTab) scheduleClose(scheduleCloseTab, closeTimerMs);
}

function cancelClose(tab) {
    const tabId = getTabId(tab);

    if (closeTimers[tabId]) {
      clearTimeout(closeTimers[tabId]); // find out why this isn't working well.
      delete closeTimers[tabId];
      console.log(`🛑 Cancelled close for tab ${tabId}`);
    }
}

function scheduleClose(tab, delayMs) {
    // cancel any existing timer first
    cancelClose(tab);

    const tabId = getTabId(tab);
  
    closeTimers[tabId] = setTimeout(() => {
      chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
          console.warn(`Could not close tab ${tabId}:`, chrome.runtime.lastError.message);
        } else {
          console.log(`Closed tab ${tabId}`);
        }
      });
      delete closeTimers[tabId];
    }, delayMs);
  
    console.log(`⏳ Scheduled close for tab ${tabId} in ${delayMs / 1000}s`);
  }

// utlity methods
function getTabId(tab) {
    if (tab == null) return null;
    return tab.id;

}