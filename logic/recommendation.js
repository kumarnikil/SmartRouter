importScripts('constants/intentKeywords.js');

const NUM_OF_PAST_QUERIES_TO_TRIGGER_ADAPTION = 1; // number of queries processed before historical count is included
const PAST_QUERIES_RATIO = 0.5; //

function getAndLogRecommendation(query, categoryHistory) {
    const q = query.trim().toLowerCase();

    // *** CATEGORY SELECTION *** //
    let category = 'informational'; // default
    
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
    category = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    // *** SD SELECTION (BASED ON CATEGORY) *** //
    const defaultRec = defaultCategoryMap[category] || 'g'; // default to Google for unknown category

    // *** Apply Basic Category-based Thomsom Sampling *** //
    const history = categoryHistory[category] || { g: 0, p: 0 };
    const total = history.g + history.p;

    let recommendation = defaultRec;
    if (total >= NUM_OF_PAST_QUERIES_TO_TRIGGER_ADAPTION) {  // only adapt after enough samples
        const ratioG = history.g / total;
        const ratioP = history.p / total;

        if (ratioG > PAST_QUERIES_RATIO) recommendation = 'g';
        else if (ratioP > PAST_QUERIES_RATIO) recommendation = 'p';
    }

    log(`Category: ${category}, Recommendation: ${recommendation.toUpperCase()} for "${query}"`);
    return [category, recommendation];
}
