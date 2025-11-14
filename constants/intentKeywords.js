const defaultCategoryMap = {
  informational: 'p', // perplexity
  navigational: 'g',  // google
  transactional: 'g',
  commercial: 'g',
  realTime: 'g',
  medical: 'p'
};

// generated via initial manual inputs with ChatGPT.
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
  "disadvantages of", "benefits of", "summarize", "rewrite", "generate", 
  "improve", "explain like", "paraphrase", "translate", "create", "draft", 
  "compose", "outline", "rephrase", "predict", "simulate", "suggest"
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
const realTimePatterns = [
  "today", "yesterday", "tomorrow", "latest", "current", "now", 
  "news", "stock", "score", "update", "breaking", "live", "trending",
  "forecast", "weather", "traffic", "streaming", "events", "results"
];
const medicalPatterns = [
  // General health terms
  "injury", "hurt", "pain", "ache", "soreness", "symptom",
  "ill", "sick", "condition", "diagnose", "health problem",
  "medical", "treatment", "medicine", "first aid",
  "what should i do", "how to treat", "cure", "heal", "remedy",
  "when to see a doctor", "doctor", "urgent care",

  // Injuries + trauma
  "broke", "fracture", "sprain", "strain", "twisted", "dislocated",
  "cut", "deep cut", "laceration", "bruise", "bleeding",
  "burn", "scald", "blister", "choking", "concussion",
  "swollen", "swelling", "stitches", "scar", "rash",
  "infection", "infected",

  // Sickness & symptoms
  "fever", "vomit", "vomiting", "diarrhea", "nausea", "dizzy",
  "cough", "sore throat", "runny nose", "congestion",
  "shortness of breath", "chest pain", "migraine", "headache",
  "earache", "toothache",

  // Mental & neurological
  "panic attack", "anxiety attack", "depression",
  "seizure", "faint", "fainting",

  // Allergies / reactions
  "allergic", "allergy", "hives", "anaphylactic", "anaphylaxis",

  // Body parts (for injury context)
  "toe", "foot", "ankle", "leg", "knee", "hip",
  "finger", "hand", "wrist", "arm", "elbow", "shoulder",
  "back", "spine", "neck", "head", "forehead",
  "eye", "ear", "nose", "mouth", "jaw",
  "rib", "chest", "abdomen", "stomach",

  // Medication queries
  "ibuprofen", "advil", "tylenol", "acetaminophen", "aspirin",
  "antibiotics", "bandage", "ice pack", "splint",

  // Health procedure advice
  "clean the wound", "apply pressure", "immobilize",
  "elevate", "rest and ice", "sterilize",
  "stop the bleeding", "wrap", "tape"
];
