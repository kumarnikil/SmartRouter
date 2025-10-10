function getAndLogRecommendation(query) {
    // ------------------------------------------------------------
    // Purpose:
    //   Decide whether a user's query should be routed to Google (direct search)
    //   or Perplexity (answer engine) using a scoring system.
    //
    // How it works:
    //   - Both engines start with a base score of 0.
    //   - Each feature (query length, structure, keywords, etc.)
    //     adds or subtracts points from either engine.
    //   - The engine with the higher final score wins.
    // ------------------------------------------------------------
    
    const q = query.trim().toLowerCase();
    const words = q.split(/\s+/);
    const wordCount = words.length;

    let perplexityScore = 0;
    let googleScore = 0;

    // ------------------------------------------------------------
    // 1. Query Length
    // ------------------------------------------------------------
    // Longer queries (>=6 words) often reflect natural language questions or reasoning tasks.
    // Short queries (<=2 words) usually indicate navigational or keyword-based intent.

    if (wordCount >= 6) perplexityScore += 3;
    else if (wordCount <= 2) googleScore += 3;
    else if (wordCount >= 3 && wordCount <= 5) {
        perplexityScore += 1;
        googleScore += 1;
    }

    // ------------------------------------------------------------
    // 2. Question Detection
    // ------------------------------------------------------------
    const questionWords = [
        "who", "what", "when", "where", "why", "how",
        "is", "are", "can", "does", "do", "should", "could",
        "would", "will", "did", "may", "might"
    ];

    if (questionWords.some(w => q.startsWith(w + " "))) {
        perplexityScore += 4; // strongly favors AI reasoning
    }

    // ------------------------------------------------------------
    // 3. Instructional / Explanatory Phrases
    // ------------------------------------------------------------
    const aiPatterns = [
        "explain", "compare", "difference between", "pros and cons",
        "summarize", "why does", "how does", "step by step",
        "how to", "what is the best", "guide", "tutorial",
        "analyze", "generate", "improve", "rewrite"
    ];
    if (aiPatterns.some(p => q.includes(p))) perplexityScore += 3;

    // ------------------------------------------------------------
    // 4. Navigational / Transactional / Local Intent
    // ------------------------------------------------------------
    const googlePatterns = [
        "youtube", "reddit", "twitter", "wikipedia",
        "login", "download", "near me", "price",
        "reviews", "map", "directions", "store", "schedule",
        "news", "restaurant", "hotel", "flight", "ticket"
    ];
    if (googlePatterns.some(p => q.includes(p))) googleScore += 4;

    // ------------------------------------------------------------
    // 5. Domain or URL-like tokens (indicates navigational intent)
    // ------------------------------------------------------------
    if (q.includes(".com") || q.includes(".org") || q.includes(".edu")) {
        googleScore += 3;
    }

    // ------------------------------------------------------------
    // 6. Presence of interrogative punctuation
    // ------------------------------------------------------------
    if (q.includes("?")) perplexityScore += 2;

    // ------------------------------------------------------------
    // 7. Recency or factual lookups (better for Google)
    // ------------------------------------------------------------
    const realTimePatterns = [
        "today", "yesterday", "tomorrow", "latest",
        "current", "now", "2025", "news", "price", "stock", "score"
    ];
    if (realTimePatterns.some(p => q.includes(p))) googleScore += 3;

    // ------------------------------------------------------------
    // 8. General fallback: if balanced, prefer Google (safer)
    // ------------------------------------------------------------
    const result = perplexityScore > googleScore ? "p" : "g";

    console.log(`🤖 Recommendation: ${result.toUpperCase()} for "${query}" | (Perplexity: ${perplexityScore}, Google: ${googleScore})`);
    return result;
}

