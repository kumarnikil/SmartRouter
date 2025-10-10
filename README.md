# SmartRouter – Intelligent Search Routing for Chrome

SmartRouter intelligently routes search queries between **Google** and **Perplexity AI** based on the query’s intent and structure.  
It analyzes the text you type — length, phrasing, and keywords — then predicts which engine will deliver the best result.  
The recommended engine opens in your current tab; the alternate opens briefly in the background and auto-closes after a short delay.

---

## File Structure
- `background.js`: manages active and background tabs, user behavior logging, and timed tab closures.  
- `recommendation.js`: houses the decision logic for routing between Google and Perplexity based on semantic factors (query length, keywords, intent, etc.).  
- `manifest.json`: sets up the Chrome extension metadata, permissions, and default omnibox keyword (`ss`).  

---

## How `recommendation.js` Works

Queries are scored based on multiple signals; the higher score determines routing.

### Scoring Factors
- **Length**
  - ≤2 words → +2 Google  
  - ≥6 words → +2 Perplexity  
- **Question words** (`how`, `why`, `what`, etc.) → +3 Perplexity  
- **Instructional phrases** (`explain`, `difference between`, `how to`) → +2 Perplexity  
- **Navigational / transactional** (`price`, `login`, `reddit`, `map`, `reviews`) → +3 Google  
- **Real-time / factual** (`today`, `score`, `stock`, `weather`) → +2 Google  
- **Final rule:**  
  - `perplexityScore > googleScore` → **Perplexity**  
  - otherwise → **Google**

---

## Configurable

- Adjust keyword weights → `logic/recommendation.js`  
- Change background tab timer (`closeTimerMs`) → `background.js`  
- Future enhancement: integrate **Thompson Sampling** for adaptive learning

---

## Example Queries

| Type | Example | Expected Route |
|------|----------|----------------|
| Simple lookup | `amazon login` | Google |
| How-to | `how to build a chrome extension` | Perplexity |
| Comparison | `gpt-4 vs claude 3 performance` | Perplexity |
| Factual | `tesla stock price` | Google |
| Research-like | `explain reinforcement learning with examples` | Perplexity |
| Local intent | `coffee shops near me` | Google |

---

## Setup & Run

1. **Clone the repository**  
   ```bash
   https://github.com/kumarnikil/SmartRouter.git
   cd SmartRouter/
   ```

2. **CLoad the extension**
- Go to `chrome://extensions`
- Enable Developer mode
- Click Load unpacked → select this project folder
  
3. ** Use SmartRouter **
- In Chrome’s omnibox, type: `<your search query>`
- SmartRouter:
  - Opens the recommended engine (Google or Perplexity) in your current tab
  - Opens the alternate engine in the background
  - Auto-closes the background tab after ~7 seconds


---

## Future Work

### 1. Learning & Adaptivity
- Implement **Thompson Sampling** or other multi-armed bandit algorithms to refine routing based on real-world performance.  
- Develop **context-aware adaptation** for user preferences, query domains, and historical behavior.  
- Introduce lightweight feedback loops (e.g., implicit click tracking or optional explicit ratings).

### 2. User Interface & Control
- Add a **Chrome popup UI** or **options page** to let users:
  - Adjust routing weights and thresholds.  
  - Modify background tab timeout duration.  
  - Choose their preferred default search engine.  
- Include simple feedback buttons (e.g., “Preferred Google” / “Preferred Perplexity”) for learning-based optimization.


