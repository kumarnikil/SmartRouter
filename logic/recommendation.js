importScripts('constants/intentKeywords.js');

const NUM_OF_PAST_QUERIES_TO_TRIGGER_ADAPTION = 6; // number of queries processed before historical count is included
const PAST_QUERIES_RATIO = 0.65; //

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
        realTime: 0,
        medical: 0,
    };

    // keyword-based query category classification
    const tokens = tokenize(q);

    // length of query based categorization
    if (tokens.length <= 2) scores.navigational += 3;
    if (tokens.length > 10) scores.informational += 3;

    // keywords based categorization
    if (informationalStarts.includes(tokens[0])) scores.informational += 3;
    if (commercialStarts.includes(tokens[0])) scores.commercial += 3;
    tokens.forEach((token) => {
        if (informationalPatterns.includes(token)) scores.informational += 2;
        if (navigationalPatterns.includes(token)) scores.navigational += 3;
        if (transactionalPatterns.includes(token)) scores.transactional += 3;
        if (commercialPatterns.includes(token)) scores.commercial += 3;
        if (realTimePatterns.includes(token)) scores.realTime += 3;
        if (medicalPatterns.includes(token)) scores.medical += 3;
    })

    log(`Tokens: ${tokens}, Scores ${JSON.stringify(scores)}`);

    const scoredCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b); // select highest score
    if (scores[scoredCategory] > 0) category = scoredCategory; // if no scores assigned, fallback to default
        
    // *** SD SELECTION (BASED ON CATEGORY) *** //
    const defaultRec = defaultCategoryMap[category] || 'g'; // default to Google for unknown category

    // *** Apply basic category-based Thomsom Sampling *** //
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

function tokenize(q) {
  return q.toLowerCase().split(/[^a-z]+/).filter(Boolean);
}
