/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
  
	  if (url.pathname === "/") {
		return serveHTML();
	  }
  
	  if (url.pathname === "/api/feedback") {
		return getFeedback(env);
	  }
  
	  if (url.pathname === "/api/analysis") {
		return getAnalysis(env);
	  }
  
	  return new Response("Not found", { status: 404 });
	},
  };
  
  // Get all feedback from D1
  async function getFeedback(env) {
	const { results } = await env.DB.prepare(
	  "SELECT * FROM feedback ORDER BY date DESC"
	).all();
  
	return Response.json(results);
  }
  
  async function getAnalysis(env) {
	// Check KV cache first
	const cached = await env.ANALYSIS_CACHE.get("latest_analysis");
	if (cached) {
	  return Response.json({ ...JSON.parse(cached), cached: true });
	}
  
	const { results } = await env.DB.prepare(
	  "SELECT content, sentiment, theme, priority, source FROM feedback"
	).all();
  
	const feedbackText = results
	  .map((r) => `[${r.source}] ${r.content}`)
	  .join("\n");
  
	const prompt = `You are a product manager assistant. Analyze this customer feedback and respond in JSON format only, no markdown.
  
  Feedback:
  ${feedbackText}
  
  Respond with exactly this JSON structure:
  {
	"summary": "2-3 sentence executive summary of the overall feedback",
	"top_themes": ["theme1", "theme2", "theme3"],
	"urgent_issues": ["issue1", "issue2"],
	"sentiment_breakdown": {"positive": 0, "negative": 0},
	"recommendation": "One clear action the team should take this week"
  }`;
  
	const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
	  prompt,
	  max_tokens: 500,
	});
  
	let analysis;
	try {
	  const text = response.response.replace(/```json|```/g, "").trim();
	  analysis = JSON.parse(text);
	} catch (e) {
	  analysis = { error: "Could not parse AI response", raw: response.response };
	}
  
	// Save to KV cache for 1 hour
	await env.ANALYSIS_CACHE.put("latest_analysis", JSON.stringify(analysis), {
	  expirationTtl: 3600,
	});
  
	return Response.json({ ...analysis, cached: false });
  }
  
  // Serve the dashboard HTML
  function serveHTML() {
	const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>PM Feedback Dashboard</title>
	<style>
	  * { margin: 0; padding: 0; box-sizing: border-box; }
	  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; min-height: 100vh; }
	  header { background: #1a1a1a; border-bottom: 1px solid #2a2a2a; padding: 20px 40px; display: flex; align-items: center; gap: 12px; }
	  header h1 { font-size: 20px; font-weight: 600; color: #fff; }
	  header span { background: #f6821f; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
	  .container { max-width: 1200px; margin: 0 auto; padding: 40px; }
	  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
	  .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; }
	  .card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 16px; }
	  .summary { grid-column: 1 / -1; }
	  .summary p { font-size: 16px; line-height: 1.7; color: #ccc; }
	  .tag { display: inline-block; background: #2a2a2a; border-radius: 6px; padding: 6px 12px; margin: 4px; font-size: 13px; }
	  .urgent { background: #2d1515; border: 1px solid #5a2020; color: #ff6b6b; }
	  .recommendation { grid-column: 1 / -1; border: 1px solid #f6821f44; }
	  .recommendation p { color: #f6821f; font-size: 15px; line-height: 1.6; }
	  .sentiment { display: flex; gap: 24px; align-items: center; }
	  .sentiment-bar { flex: 1; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden; }
	  .sentiment-fill { height: 100%; border-radius: 4px; }
	  .positive { background: #22c55e; }
	  .negative-bar { background: #ef4444; }
	  .stat { font-size: 28px; font-weight: 700; color: #fff; }
	  .stat-label { font-size: 13px; color: #888; margin-top: 4px; }
	  .feedback-table { grid-column: 1 / -1; }
	  table { width: 100%; border-collapse: collapse; }
	  th { text-align: left; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; border-bottom: 1px solid #2a2a2a; }
	  td { padding: 12px; border-bottom: 1px solid #1e1e1e; font-size: 14px; color: #ccc; }
	  tr:hover td { background: #1e1e1e; }
	  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
	  .badge.positive { background: #052e16; color: #22c55e; }
	  .badge.negative { background: #2d1515; color: #ef4444; }
	  .badge.high { background: #2d1515; color: #ef4444; }
	  .badge.medium { background: #2d1a00; color: #f59e0b; }
	  .badge.low { background: #052e16; color: #22c55e; }
	  .source-badge { background: #2a2a2a; color: #aaa; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
	  .loading { color: #888; font-style: italic; }
	  button { background: #f6821f; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
	  button:hover { background: #e07010; }
	</style>
  </head>
  <body>
	<header>
	  <h1>⚡ PM Feedback Dashboard</h1>
	  <span>Morning Briefing</span>
	</header>
	<div class="container">
	  <div class="grid" id="analysis-grid">
		<div class="card summary"><h2>AI Summary</h2><p class="loading">Loading AI analysis...</p></div>
	  </div>
	  <div class="grid">
		<div class="card feedback-table">
		  <h2>All Feedback</h2>
		  <table id="feedback-table">
			<thead><tr><th>Source</th><th>Content</th><th>Sentiment</th><th>Priority</th><th>Theme</th><th>Date</th></tr></thead>
			<tbody><tr><td colspan="6" class="loading">Loading feedback...</td></tr></tbody>
		  </table>
		</div>
	  </div>
	</div>
  
	<script>
	  async function loadFeedback() {
		const res = await fetch('/api/feedback');
		const data = await res.json();
		const tbody = document.querySelector('#feedback-table tbody');
		tbody.innerHTML = data.map(f => \`
		  <tr>
			<td><span class="source-badge">\${f.source}</span></td>
			<td>\${f.content}</td>
			<td><span class="badge \${f.sentiment}">\${f.sentiment}</span></td>
			<td><span class="badge \${f.priority}">\${f.priority}</span></td>
			<td>\${f.theme}</td>
			<td>\${f.date}</td>
		  </tr>
		\`).join('');
	  }
  
	  async function loadAnalysis() {
		const res = await fetch('/api/analysis');
		const d = await res.json();
		const grid = document.getElementById('analysis-grid');
		grid.innerHTML = \`
		  <div class="card summary"><h2>AI Summary</h2><p>\${d.summary || 'N/A'}</p></div>
		  <div class="card">
			<h2>Top Themes</h2>
			\${(d.top_themes || []).map(t => \`<span class="tag">\${t}</span>\`).join('')}
		  </div>
		  <div class="card">
			<h2>🚨 Urgent Issues</h2>
			\${(d.urgent_issues || []).map(i => \`<span class="tag urgent">\${i}</span>\`).join('')}
		  </div>
		  <div class="card">
			<h2>Sentiment Breakdown</h2>
			<div class="sentiment">
			  <span style="color:#22c55e">\${d.sentiment_breakdown?.positive || 0} positive</span>
			  <div class="sentiment-bar"><div class="sentiment-fill positive" style="width:\${(d.sentiment_breakdown?.positive || 0) * 5}%"></div></div>
			</div>
			<div class="sentiment" style="margin-top:8px">
			  <span style="color:#ef4444">\${d.sentiment_breakdown?.negative || 0} negative</span>
			  <div class="sentiment-bar"><div class="sentiment-fill negative-bar" style="width:\${(d.sentiment_breakdown?.negative || 0) * 5}%"></div></div>
			</div>
		  </div>
		  <div class="card recommendation">
			<h2>💡 This Week's Recommendation</h2>
			<p>\${d.recommendation || 'N/A'}</p>
		  </div>
		\`;
	  }
  
	  loadFeedback();
	  loadAnalysis();
	</script>
  </body>
  </html>`;
  
	return new Response(html, {
	  headers: { "Content-Type": "text/html" },
	});
  }
