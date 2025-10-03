function getRecommendation(query) {
    // TODO: Update with keyword analysis
    console.log("Making recommendation for query:", query);
    if (query.startsWith("ai ")) {
        return "p";
    }
    return "g"; // or "Perplexity"
}

