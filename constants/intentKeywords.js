const questionWords = [
  "who", "what", "when", "where", "why", "how",
  "is", "are", "can", "does", "do", "should", 
  "could", "would", "will", "did", "may", "which", "whom", "whose"
];
const informationalPatterns = [
  "explain", "compare", "difference between", "pros", "cons",
  "summarize", "why does", "how does", "step by step", "how to",
  "what is the best", "guide", "tutorial", "analyze", "generate",
  "improve", "rewrite", "history of", "definition of", "causes of",
  "effects of", "examples", "overview of", "tips for", "advantages of",
  "disadvantages of", "benefits of"
];
const navigationalPatterns = [
  "youtube", "reddit", "twitter", "wikipedia", "login", 
  "download", "map", "directions", ".com", ".org", ".edu",
  "facebook", "instagram", "linkedin", "github", "pinterest",
  "portal", "account", "dashboard", "profile", "settings"
];
const transactionalPatterns = [
  "buy", "order", "ticket", "register", "download", 
  "price", "schedule", "reservation", "purchase", "subscribe",
  "sign up", "booking", "rent", "membership", "checkout"
];
const commercialPatterns = [
  "best", "reviews", "top", "compare", "cheap", 
  "discount", "deal", "offers", "ratings", "affordable",
  "premium", "brand", "quality", "recommendations", "versus"
];
const generativePatterns = [
  "summarize", "rewrite", "generate", "improve", "explain like",
  "paraphrase", "translate", "create", "draft", "compose",
  "outline", "rephrase", "predict", "simulate", "suggest"
];
const realTimePatterns = [
  "today", "yesterday", "tomorrow", "latest", "current", "now", 
  "news", "stock", "score", "update", "breaking", "live", "trending",
  "forecast", "weather", "traffic", "streaming", "events", "results"
];

const defaultCategoryMap = {
  informational: 'p', // perplexity
  navigational: 'g',  // google
  transactional: 'g',
  commercial: 'g',
  generative: 'p',
  realTime: 'g',
  memory: 'p'
};
