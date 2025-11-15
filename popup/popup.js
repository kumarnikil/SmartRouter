document.getElementById("downloadLogs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "GET_CSV_LOGS" }, (response) => {
        if (!response?.logs?.length) {
            showStatus("No logs to download.");
            return;
        }
        const logs = response.logs;
        const headers = ["timestamp", "category", "engine", "choiceType", "categoryHistoryStr"];
        const csvRows = [
            headers.join(","),
            ...logs.map(row =>
                headers.map(h => `"${(row[h] || "").replace(/"/g, '""')}"`).join(",")
            )
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "smartrouter_logs.csv";
        a.click();
        URL.revokeObjectURL(url);

        showStatus("CSV downloaded.");
    });
});

document.getElementById("clearLogs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLEAR_CSV_LOGS" }, () => {
        showStatus("Logs cleared.");
    });
});

function showStatus(msg) {
    const el = document.getElementById("status");
    el.textContent = msg;
    setTimeout(() => el.textContent = "", 2500);
}
