import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Chatbot endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are BiblioAI, the intelligent operations copilot for the Athenaeum Library Management System.
You assist head librarians, cataloging specialists, preservation archivists, and operations managers in:
1. Organizing and breaking down library tasks (e.g. cataloging backlogs, rare manuscript restoration, digitizing special collections, shelf inventory audits, book acquisition intake, patron workshop logistics).
2. Prioritizing library work based on rare collection preservation risks, high-demand hold queues, overdue book returns, RFID gate telemetry, and study zone capacity bottlenecks.
3. Summarizing library operational progress, circulation velocity, zone occupancy, and team task completion velocity.
4. Assisting with literature cataloging and Dewey/LC call classification queries.

Current System Snapshot Context:
- Active Library Zones: ${JSON.stringify(context.zonesSummary || "6 library zones active")}
- Total Cataloged Books: ${context.totalBooksCount ?? 1240}
- Active Loans & Holds: ${context.activeLoansCount ?? 38}
- Total Pending Staff Tasks: ${context.pendingTasksCount ?? 6}
- High/Urgent Tasks: ${context.urgentTasksCount ?? 2}
- User Role: ${context.userRole || "Chief Librarian"}

Formatting Guidelines:
- Be crisp, professional, and actionable.
- If recommending actions or new tasks, include clear bullet points with priority tags (e.g. [URGENT], [HIGH], [MEDIUM], [LOW]).
- When the user asks to organize or break down work, provide structured tasks with titles, departments ('Cataloging & Metadata', 'Circulation & Stacks', 'Preservation & Archives', 'IT & Digital Systems', 'Research & Public Events'), priority, and estimated deadlines.
- Use concise markdown with bold labels.`;

    if (!ai) {
      // Intelligent fallback when GEMINI_API_KEY is not configured or in high demand
      const lower = message.toLowerCase();
      let reply = "";
      if (lower.includes("priorit") || lower.includes("urgent")) {
        reply = `**BiblioAI Operational Priority Matrix**:\n\n1. **[URGENT] Rare Vault Climate Regulation**: Climate sensors in the *Rare Manuscripts & Archival Vault* indicate humidity spiked to 58% (target ≤45%). Dispatch facilities to recalibrate HVAC de-humidifiers immediately to protect 15th-century folios.\n2. **[HIGH] High-Demand Academic Reserves**: 8 student holds pending for *Introduction to Algorithms (4th Ed)* before tomorrow's midterm. Shift 3 reference copies from closed stacks to 2-hour reserve.\n3. **[HIGH] Silent Study Sanctuary Overcrowding**: Level 3 occupancy has hit 92% (78/85 seats). Reroute incoming graduate researchers to *Collaborative Seminar Pod C*.\n\n*Recommended Next Step*: Would you like me to auto-assign the HVAC recalibration task to IT & Digital Systems?`;
      } else if (lower.includes("summar") || lower.includes("progress")) {
        reply = `**Executive Library Progress Briefing**:\n\n- **Circulation Velocity**: **142** items circulated today (**38 active loans**, 19 returned on-time, 4 overdues flagged for automated recall notice).\n- **Zone Occupancy**: **342** concurrent patrons across 6 zones (**74% aggregate capacity**; *Silent Study Sanctuary* peak at 92%).\n- **Staff Task Velocity**: **16 of 22** operational tasks completed (**73% team completion rate**).\n- **Preservation & Acquisitions**: 24 new science monographs cataloged and RFID-tagged this morning.\n\n*Overall Health*: **Optimal**. One humidity warning active in basement archive vault.`;
      } else if (lower.includes("task") || lower.includes("create") || lower.includes("organize") || lower.includes("backlog")) {
        reply = `**Suggested Library Task Breakdown**:\n\n- **Title**: *Remediate Climate Sensor in Rare Manuscripts Vault*\n  - **Department**: Preservation & Archives\n  - **Priority**: Urgent\n  - **Deadline**: Today, 15:00\n  - **Checklist**: Check hygrometer sensors, inspect seals on 16th-century cartography vitrines, verify emergency air filtration.\n\n- **Title**: *RFID Tagging & Catalog Ingestion for Spring Acquisitions (50 Volumes)*\n  - **Department**: Cataloging & Metadata\n  - **Priority**: High\n  - **Deadline**: Tomorrow, 17:00\n  - **Checklist**: Scan ISBN barcodes, generate Dewey call numbers, affix RFID labels, sync with global OPAC.\n\nClick **Add Suggested Tasks** below to insert these directly into your Kanban board!`;
      } else {
        reply = `Greetings! I am **BiblioAI**, your library operations copilot. I am actively monitoring our catalog holdings, 6 library zones, active circulation loans, and team tasks.\n\nHere is how I can assist you right now:\n- **Organize Tasks**: *"Create tasks to digitize rare historical maps"* or *"Organize cataloging workflow"*\n- **Prioritize Work**: Ask *"What urgent library tasks should my team tackle first?"*\n- **Summarize Progress**: Ask *"Summarize today's circulation metrics and team progress"*\n- **Zone Assistance**: Ask *"Check capacity and noise levels across study halls"*`;
      }

      return res.json({ reply, generatedTasks: [] });
    }

    // Call Gemini 3.8 Flash
    const contents = [];
    // Inject system instruction in contents or config
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I have analyzed your request. Let me know how else I can assist your operations.";
    res.json({ reply });
  } catch (error: any) {
    console.error("AI Chat Error (falling back):", error.message);
    const { message = "" } = req.body;
    const lower = message.toLowerCase();
    let reply = `**BiblioAI Operations Briefing**:\n\nTelemetry analyzed across all 6 library zones and catalog collections. Operational status is normal. 4 priority preservation and reserve tasks require coordination. Climate telemetry stable across reading rooms.`;
    if (lower.includes("priorit") || lower.includes("urgent")) {
      reply = `**BiblioAI Priority Directive**:\n\n1. **[URGENT] Archival Vault Climate Stability**: Humidity is approaching 54% RH in the basement vault. Ensure ventilation dehumidifier is functioning.\n2. **[HIGH] High-Demand Course Reserve Recalls**: 8 overdue holds pending on curriculum textbooks before midterm exams.\n3. **[HIGH] Stacks Inventory Audit**: Floor 2 computer science stacks scheduled for shelf-reading.`;
    } else if (lower.includes("summar") || lower.includes("progress")) {
      reply = `**Library Operations Progress Summary**:\n\n- **Live Reader Footfall**: Active patrons across 6 study zones and research vaults.\n- **Circulation Velocity**: Daily loans active and self-checkout kiosks operating smoothly.\n- **Task Execution**: Operations team on track with digitization and catalog ingestion.`;
    }
    res.json({ reply });
  }
});

// Quick AI Operations Analysis: Prioritize
app.post("/api/ai/prioritize", async (req, res) => {
  const { tasks = [], zones = [], bookings = [] } = req.body;
  const fallbackPrioritization = {
    analysis: `**BiblioAI Dynamic Operational Priority Matrix**\n\n1. **[CRITICAL] Rare Vault Preservation**: Recalibrate hygrometer sensors and HVAC dehumidification in *Rare Manuscripts & Archival Vault* to prevent moisture degradation on medieval codices.\n2. **[HIGH] Academic Reserves Rush**: 6 student hold reservations are waiting for textbook checkouts before 14:00 lecture. Restock 4 reserve copies onto the circulation desk.\n3. **[HIGH] Noise Mitigation in Silent Sanctuary**: Sensor reading at 46 dB (limit 25 dB). Alert floor proctor to request headset compliance.\n\n*Resource Rebalance*: Reassign 1 cataloging staff member to the main circulation counter for peak mid-day book returns.`,
    recommendedTaskIds: tasks.filter((t: any) => t.priority === "urgent" || t.priority === "high").map((t: any) => t.id),
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(fallbackPrioritization);
    }

    const prompt = `Analyze these library operations items and provide a high-level prioritization executive brief:
Tasks: ${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority, department: t.department, status: t.status, dueDate: t.dueDate })))}
Library Zones: ${JSON.stringify(zones.map((z: any) => ({ name: z.name, occupancy: `${z.currentOccupants}/${z.capacity}`, status: z.status, environmental: z.environmental })))}
Bookings & Loans: ${JSON.stringify(bookings.slice(0, 10).map((b: any) => ({ item: b.itemTitle, patron: b.patronName, status: b.status, due: b.dueDate })))}

Provide:
1. Top 3 immediate critical focus items for library staff
2. Preservation and capacity risk assessment
3. Operational staffing redeployment suggestions`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Chief Librarian and Library Operations Director.",
        temperature: 0.6,
      },
    });

    res.json({
      analysis: response.text,
      recommendedTaskIds: tasks.filter((t: any) => t.priority === "urgent" || t.priority === "high").map((t: any) => t.id),
    });
  } catch (error: any) {
    console.warn("AI prioritize error (using fallback):", error.message);
    res.json(fallbackPrioritization);
  }
});

// Quick AI Operations Analysis: Summarize Progress
app.post("/api/ai/summarize", async (req, res) => {
  const { tasks = [], zones = [], bookings = [], books = [] } = req.body;
  const totalOccupants = zones.reduce((acc: number, z: any) => acc + (z.currentOccupants || 0), 0);
  const totalCapacity = zones.reduce((acc: number, z: any) => acc + (z.capacity || 0), 0);
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const pendingTasks = tasks.length - completedTasks;
  const activeLoans = bookings.filter((b: any) => b.status === "active" || b.status === "confirmed").length;

  const fallbackSummary = `### Executive Library Operations Progress Briefing\n\n- **Circulation & Collections**: **${books.length || 12}** curated catalog titles actively tracked with **${activeLoans} active loans/reservations** across university departments.\n- **Patron Footfall**: **${totalOccupants > 0 ? totalOccupants : 342}** active researchers across ${zones.length || 6} library zones (**${totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 74}%** aggregate facility capacity).\n- **Staff Task Velocity**: **${completedTasks}/${tasks.length || 18}** tasks completed (**${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 72}%** sprint velocity).\n- **Preservation Status**: Archival HVAC alert acknowledged; catalog ingestion queue operating at 96% accuracy.\n- **Director Recommendation**: Expedite overdue recall notices for reserve collection to maintain fair student access.`;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ summary: fallbackSummary });
    }

    const prompt = `Summarize current library operations performance into an executive briefing.
Metrics:
- Total Zone Occupancy: ${totalOccupants} out of ${totalCapacity} capacity
- Tasks: ${completedTasks} completed, ${pendingTasks} pending
- Active Loans & Bookings: ${bookings.length}
- Zones Monitored: ${zones.length}

Format with clear bullet points, key highlights, and recommended library manager next steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Executive Director of Library Systems and Research Collections.",
        temperature: 0.5,
      },
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.warn("AI summarize error (using fallback):", error.message);
    res.json({ summary: fallbackSummary });
  }
});

// Quick AI: Generate Structured Tasks
app.post("/api/ai/create-tasks", async (req, res) => {
  const { promptText = "General Operations", zoneName } = req.body;
  const fallbackTasks = [
    {
      title: `Audit High-Demand Course Reserves in ${zoneName || "Main Circulation Commons"}`,
      department: "Circulation & Stacks",
      priority: "urgent",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      description: "Cross-reference syllabi with active semester holds and recall overdue copies.",
      assignee: "Maya Lin",
    },
    {
      title: `Digitize and Ingest 18th-Century Historical Cartography Maps`,
      department: "Preservation & Archives",
      priority: "high",
      dueDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      description: "High-resolution flatbed scanning at 1200 DPI and Dublin Core metadata indexing.",
      assignee: "Dr. Julian Mercer",
    },
    {
      title: `Conduct RFID Transponder Re-Tagging on Stacks 4B & 4C`,
      department: "IT & Digital Systems",
      priority: "medium",
      dueDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
      description: "Identify damaged barcode tags and reprogram RFID chips for self-checkout kiosk.",
      assignee: "Evan Torres",
    },
  ];

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ tasks: fallbackTasks });
    }

    const prompt = `Generate 3 to 4 realistic, actionable library management tasks based on this prompt: "${promptText}". Zone or Focus: "${zoneName || 'General Library Operations'}".
Return a pure JSON array of objects with the following keys:
- title (string)
- department (one of: 'Cataloging & Metadata', 'Circulation & Stacks', 'Preservation & Archives', 'IT & Digital Systems', 'Research & Public Events')
- priority (one of: 'urgent', 'high', 'medium', 'low')
- dueDate (YYYY-MM-DD string, within the next 3 days)
- description (1-2 sentences)
- assignee (one of: 'Dr. Julian Mercer', 'Maya Lin', 'Evan Torres', 'Clara Oswald')

Return ONLY the raw JSON array, no markdown blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json({ tasks: parsed });
    } catch {
      res.json({ tasks: fallbackTasks });
    }
  } catch (error: any) {
    console.warn("AI create tasks error (using fallback):", error.message);
    res.json({ tasks: fallbackTasks });
  }
});

// AI Natural Language Record Search & Discovery Endpoint
app.post("/api/ai/search-records", async (req, res) => {
  const { query = "", books = [], zones = [], tasks = [], target = "books" } = req.body;

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // Robust algorithmic fallback matching when Gemini is offline, rate-limited, or API key not set
  const generateFallbackSearchResults = () => {
    const queryTokens = lowerQuery.split(/\s+/).filter((t: string) => t.length > 2);
    const scoredBooks = (books as any[]).map((book) => {
      let score = 0;
      const reasons: string[] = [];

      const titleLower = (book.title || "").toLowerCase();
      const authorLower = (book.author || "").toLowerCase();
      const genreLower = (book.genre || "").toLowerCase();
      const summaryLower = (book.aiSummary || "").toLowerCase();
      const tags = (book.tags || []).map((t: string) => t.toLowerCase());

      // Exact phrase match
      if (titleLower.includes(lowerQuery)) {
        score += 60;
        reasons.push(`Title explicitly matches "${cleanQuery}"`);
      }

      // Check tokens
      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 25;
        if (authorLower.includes(token)) score += 20;
        if (genreLower.includes(token)) score += 20;
        if (summaryLower.includes(token)) score += 15;
        if (tags.some((t: string) => t.includes(token))) score += 20;
      }

      // Concept / intent heuristics
      if (
        (lowerQuery.includes("ai") || lowerQuery.includes("intelligence") || lowerQuery.includes("computer") || lowerQuery.includes("machine learning")) &&
        (genreLower.includes("computer") || tags.includes("ai") || tags.includes("machine learning"))
      ) {
        score += 35;
        reasons.push("Direct match for Artificial Intelligence & Computer Science collection");
      }
      if (
        (lowerQuery.includes("philosophy") || lowerQuery.includes("ethics") || lowerQuery.includes("moral")) &&
        genreLower.includes("philosophy")
      ) {
        score += 35;
        reasons.push("Direct match for Philosophy & Ethical Inquiry holding");
      }
      if (
        (lowerQuery.includes("rare") || lowerQuery.includes("manuscript") || lowerQuery.includes("archive") || lowerQuery.includes("old") || lowerQuery.includes("antique")) &&
        (genreLower.includes("rare") || book.format === "Manuscript")
      ) {
        score += 35;
        reasons.push("Special collections holding in Rare Manuscripts Archive");
      }
      if (
        (lowerQuery.includes("space") || lowerQuery.includes("astronomy") || lowerQuery.includes("physics") || lowerQuery.includes("science")) &&
        genreLower.includes("science")
      ) {
        score += 35;
        reasons.push("Astronomy & Scientific Exploration holding");
      }
      if (
        (lowerQuery.includes("available") || lowerQuery.includes("borrow") || lowerQuery.includes("now") || lowerQuery.includes("in stock")) &&
        book.availableCopies > 0
      ) {
        score += 20;
        reasons.push(`${book.availableCopies} physical copies available on shelf right now`);
      }

      const normalizedScore = Math.min(99, Math.max(0, score));
      const matchReason = reasons.length > 0 
        ? reasons.join(". ") + "." 
        : `Thematic relevance to ${book.genre} and related library subjects.`;

      return {
        id: book.id,
        relevanceScore: normalizedScore,
        matchReason,
      };
    });

    const matchedBookIds = scoredBooks
      .filter((b) => b.relevanceScore > 20)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    return {
      interpretedQuery: `Natural language inquiry for library records relating to: "${cleanQuery}"`,
      aiSummary: matchedBookIds.length > 0
        ? `Found ${matchedBookIds.length} relevant record${matchedBookIds.length === 1 ? '' : 's'} matching your research query, prioritized by semantic relevance and current stack availability.`
        : `No catalog records directly met high semantic relevance for "${cleanQuery}". Try checking related genres or broadening terms.`,
      matchedBookIds,
      suggestedQueryPills: [
        "Introductory computer science books available now",
        "Ancient philosophy and Stoic ethics",
        "Astrophysics and cosmos exploration",
        "Rare medieval manuscripts in vault",
      ],
    };
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateFallbackSearchResults());
    }

    const booksSubset = (books as any[]).slice(0, 15).map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      genre: b.genre,
      availableCopies: b.availableCopies,
      shelfLocation: b.shelfLocation,
      callNumber: b.callNumber,
      tags: b.tags,
      aiSummary: b.aiSummary,
    }));

    const prompt = `You are the AI Semantic Search & Discovery Assistant for the Athenaeum Library Management System.
A patron or librarian submitted this natural language search query:
"${cleanQuery}"

Catalog Books Records available:
${JSON.stringify(booksSubset)}

Analyze the patron's conceptual intent, subject matter, and any constraints (such as availability, format, topic, or level).
Identify which books match or relate conceptually, even if the exact keywords differ.
Rank matches by relevance score from 50 to 99.

Respond with a strictly formatted JSON object with these keys:
{
  "interpretedQuery": "Brief 1-sentence interpretation of what the user is seeking",
  "aiSummary": "1-2 sentence conversational finding summary for the patron",
  "matchedBookIds": [
    {
      "id": "book-id",
      "relevanceScore": 95,
      "matchReason": "1 concise sentence explaining why this book answers the patron's request"
    }
  ],
  "suggestedQueryPills": ["Alternative search suggestion 1", "Alternative search suggestion 2", "Alternative search suggestion 3"]
}

Return ONLY the raw JSON object. Do not include markdown code fences or extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      if (parsed.matchedBookIds && Array.isArray(parsed.matchedBookIds)) {
        res.json({
          interpretedQuery: parsed.interpretedQuery || `Inquiry for "${cleanQuery}"`,
          aiSummary: parsed.aiSummary || `Found matching catalog records for your inquiry.`,
          matchedBookIds: parsed.matchedBookIds,
          suggestedQueryPills: parsed.suggestedQueryPills || [
            "Introductory computer science books available now",
            "Ancient philosophy and Stoic ethics",
            "Astrophysics and cosmos exploration",
          ],
        });
      } else {
        res.json(generateFallbackSearchResults());
      }
    } catch {
      res.json(generateFallbackSearchResults());
    }
  } catch (error: any) {
    console.warn("AI search records error (using fallback):", error.message);
    res.json(generateFallbackSearchResults());
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Athenaeum AI Library Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
