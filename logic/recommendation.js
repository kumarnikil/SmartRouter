function getAndLogRecommendation(query) {
    const q = query.trim().toLowerCase();

    // *** CATEGORY SELECTION *** //
    let category = 'informational'; // default
    const questionWords = ["who", "what", "when", "where", "why", "how", "is", "are", "can", "does", "do", "should", "could", "would", "will", "did", "may", "might"];
    
    const informationalPatterns = ["explain", "compare", "difference between", "pros and cons", "summarize", "why does", "how does", "step by step", "how to", "what is the best", "guide", "tutorial", "analyze", "generate", "improve", "rewrite"];
    const navigationalPatterns = ["youtube", "reddit", "twitter", "wikipedia", "login", "download", "map", "directions", ".com", ".org", ".edu"];
    const transactionalPatterns = ["buy", "order", "ticket", "register", "download", "price", "schedule"];
    const commercialPatterns = ["best", "reviews", "top", "compare"];
    const generativePatterns = ["summarize", "rewrite", "generate", "improve", "explain like"];
    const realTimePatterns = ["today", "yesterday", "tomorrow", "latest", "current", "now", "news", "stock", "score"];

    // simple scoring
    let scores = {
        informational: 0,
        navigational: 0,
        transactional: 0,
        commercial: 0,
        generative: 0,
        realTime: 0,
    };

    // question detection
    if (questionWords.some(w => q.startsWith(w + " "))) scores.informational += 3;

    informationalPatterns.forEach(p => { if (q.includes(p)) scores.informational += 2; });
    navigationalPatterns.forEach(p => { if (q.includes(p)) scores.navigational += 3; });
    transactionalPatterns.forEach(p => { if (q.includes(p)) scores.transactional += 3; });
    commercialPatterns.forEach(p => { if (q.includes(p)) scores.commercial += 3; });
    generativePatterns.forEach(p => { if (q.includes(p)) scores.generative += 3; });
    realTimePatterns.forEach(p => { if (q.includes(p)) scores.realTime += 3; });

    // select highest score
    category = Object.keys(scores).reduce((a,b) => scores[a] > scores[b] ? a : b);
    
    // *** SD SELECTION (BASED ON CATEGORY) *** //

    // TODO: Incorporate Thomson Sampling into weights here
    const defaultCategoryMap = {
        informational: 'p', // perplexity
        navigational: 'g',  // google
        transactional: 'g',
        commercial: 'g',
        generative: 'p',
        realTime: 'g',
        memory: 'p'
    };
    const recommendation = defaultCategoryMap[category] || 'g';

    console.log(`Category: ${category}, Recommendation: ${recommendation.toUpperCase()} for "${query}"`);
    return recommendation;
}

