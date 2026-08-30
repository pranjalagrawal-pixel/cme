import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ override: false });

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Basic abuse/cost protection for public AI endpoints. This is intentionally
// dependency-free and resets when the server restarts; production deployments
// should also use an edge/WAF rate limit.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function aiRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = rateBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  if (current.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many AI requests. Please wait a minute and try again.' });
  }

  current.count += 1;
  return next();
}

function requireText(value: unknown, field: string, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

app.use('/api/', aiRateLimit);
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now >= bucket.resetAt) rateBuckets.delete(key);
  }
}, RATE_WINDOW_MS).unref();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'concept-made-easy',
        }
      }
    })
  : null;

if (!apiKey) {
  console.warn(
    "[CME] GEMINI_API_KEY is not configured. Gemini-powered features will return a helpful configuration error."
  );
}

// API Routes
app.post("/api/solve-doubt", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    });
  }
  const question = requireText(req.body?.question, 'Question', 8000);
  const subject = requireText(req.body?.subject, 'Subject', 120) || 'General';
  const studentClass = requireText(req.body?.studentClass, 'Class', 40) || '10';
  if (!question) {
    return res.status(400).json({ error: 'Question is required and must be 1-8000 characters.' });
  }

  try {
    const prompt = `You are an expert teacher at "Concept Made Easy Classes" for Class ${studentClass}.
A student has submitted a doubt regarding the subject: ${subject}.

Please provide a highly detailed, step-by-step, accurate, and supportive explanation.
1. Be encouraging and clear.
2. Break the explanation down into logical, easy-to-digest steps.
3. Highlight any core formulas, laws, or theorems used (bold them).
4. Do not assume any advanced background beyond Class ${studentClass}.
5. Format the response nicely in standard Markdown so it can be rendered beautifully.

Student's Doubt:
"${question}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({ answer: response.text });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Unable to reach Gemini AI at the moment. Please try again later or ask a manual mentor." });
  }
});

app.post("/api/explain-concept", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    });
  }
  const topic = requireText(req.body?.topic, 'Topic', 500);
  const subject = requireText(req.body?.subject, 'Subject', 120) || 'General';
  const studentClass = requireText(req.body?.studentClass, 'Class', 40) || '10';
  const style = typeof req.body?.style === 'string' ? req.body.style : '';
  const includeQuiz = req.body?.includeQuiz === true;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required and must be 1-500 characters.' });
  }

  try {
    let stylePrompt = "";
    if (style === "ELI5") {
      stylePrompt = "Explain Like I'm 5 (ELI5): Use extremely simple, friendly words, silly but clear analogies, and absolute basics. Keep sentences short and playful.";
    } else if (style === "analogy") {
      stylePrompt = "Visual Analogies: Relate the concept directly to physical, everyday real-world examples (e.g. current like water flow, capacitor like a bucket/sponge). Make the analogy highly detailed.";
    } else if (style === "rigorous") {
      stylePrompt = "Detailed & Mathematical: Focus on step-by-step mathematical logic, formulas, derivations, variables definition, and logical proofs. Ensure equations are nicely formatted in standard markdown LaTeX notation.";
    } else {
      stylePrompt = "CBSE Exam Oriented: Focus on standard textbook definitions, board-style points, diagram descriptions, and key points that evaluation examiners look for.";
    }

    const prompt = `You are an expert, encouraging, and supportive tutor at "Concept Made Easy Classes".
Explain the topic: "${topic}" in the context of the subject: "${subject}" to a student in Class ${studentClass}.

Requirements for your explanation:
1. Adhere strictly to this style instruction: ${stylePrompt}
2. Ensure the explanation is fully detailed, highly accurate, and tailored for Class ${studentClass} level.
3. Keep the content deeply structured. Use bolding, clear paragraph breaks, or lists where helpful.
4. Construct a single, highly relatable everyday analogy explaining this concept (max 2 sentences).
5. Compile 3-4 key memory/takeaway bullet points for revision.
6. ${includeQuiz ? 'Generate exactly 3 multiple-choice questions for a concept check quiz. Each question must have exactly 4 options, a correct answer index (0 to 3), and a short explanation explaining why it is correct.' : 'Do not include a quiz.'}

Provide your response in a valid JSON structure following the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { 
              type: Type.STRING, 
              description: "Detailed step-by-step topic explanation in standard markdown format (e.g., using bold, lists, sections). Do not include any HTML tags." 
            },
            analogy: { 
              type: Type.STRING, 
              description: "A simple, highly relatable everyday analogy explaining the core concept in 1-2 sentences." 
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 short, concise key takeaways or revision checklist points."
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The quiz question." },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }, 
                    description: "Exactly 4 multiple choice options." 
                  },
                  correctAnswerIndex: { 
                    type: Type.INTEGER, 
                    description: "The 0-based index of the correct option (0, 1, 2, or 3)." 
                  },
                  explanation: { 
                    type: Type.STRING, 
                    description: "A short feedback explaining why this choice is correct." 
                  }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              },
              description: "Exactly 3 multiple choice questions based on the explanation. Leave empty if includeQuiz is false."
            }
          },
          required: ["explanation", "analogy", "keyTakeaways"]
        }
      }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (err: any) {
    console.error("Concept Explainer Error:", err);
    res.status(500).json({ error: "Unable to synthesize explanation at the moment. Please try again later." });
  }
});

app.post("/api/generate-flashcards", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    });
  }
  const topic = requireText(req.body?.topic, 'Topic', 500);
  const subject = requireText(req.body?.subject, 'Subject', 120) || 'General';
  const studentClass = requireText(req.body?.studentClass, 'Class', 40) || '10';
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required and must be 1-500 characters.' });
  }

  try {
    const prompt = `You are an expert, encouraging, and supportive tutor at "Concept Made Easy Classes".
Generate a deck of exactly 6 high-yield, interactive revision flashcards for the topic: "${topic}" in the context of the subject: "${subject}" specifically tailored for a Class ${studentClass} student.

Each card must contain:
1. front: A clear, engaging question, term, or prompt designed to test retrieval (max 15 words).
2. back: A punchy, precise, and memory-friendly answer or explanation (max 35 words). Use bullet points if appropriate but keep it very concise.
3. category: Strictly one of: "Definition", "Core Formula", "Process & Mechanism", "Real-world Application", or "Common Exam Trap".
4. hint: A highly memorable mnemonic or tiny visual hint to guide the student's retrieval (max 10 words).

Provide your response in a valid JSON structure following the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "Retrieval question, formula prompt, or term on the front of the flashcard." },
                  back: { type: Type.STRING, description: "Precise, punchy answer/explanation on the back of the flashcard." },
                  category: { type: Type.STRING, description: "Strictly 'Definition', 'Core Formula', 'Process & Mechanism', 'Real-world Application', or 'Common Exam Trap'." },
                  hint: { type: Type.STRING, description: "A tiny study clue or mnemonic to help the student remember." }
                },
                required: ["front", "back", "category", "hint"]
              },
              description: "List of exactly 6 revision flashcards."
            }
          },
          required: ["cards"]
        }
      }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (err: any) {
    console.error("Flashcards Generator Error:", err);
    res.status(500).json({ error: "Unable to generate flashcard deck at the moment. Please try again later." });
  }
});

app.post("/api/summarize-lecture", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    });
  }
  const topic = requireText(req.body?.topic, 'Topic', 500);
  const subject = requireText(req.body?.subject, 'Subject', 120) || 'General';
  const teacherName = requireText(req.body?.teacherName, 'Teacher name', 160) || 'Faculty';
  const studentClass = requireText(req.body?.studentClass, 'Class', 40) || '10';
  const whiteboardSnapshot = typeof req.body?.whiteboardSnapshot === 'string' ? req.body.whiteboardSnapshot.slice(0, 12000) : '';
  const chatHistoryJson = typeof req.body?.chatHistoryJson === 'string' ? req.body.chatHistoryJson.slice(0, 12000) : '';
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required and must be 1-500 characters.' });
  }

  try {
    const prompt = `You are a master academic summarizer at "Concept Made Easy Classes".
Summarize the recorded video lecture session for Class ${studentClass || '10'}.
Topic: "${topic}"
Subject: "${subject || 'General'}"
Faculty Mentor: "${teacherName || 'Faculty'}"

Whiteboard Notes from the Session:
${whiteboardSnapshot || 'None provided'}

Class Q&A Chat Logs:
${chatHistoryJson || 'None provided'}

Generate a structured, bulleted summary and cheat sheet for students preparing for CBSE/State Board & Entrance exams.
Include:
1. Title matching or improving the topic name
2. High-Level Executive Summary (2-3 punchy sentences)
3. 5 to 7 Key Takeaways & Core Concepts (bullet points)
4. 3 to 5 Critical Formulas, Equations, or Definitions (with clear descriptions)
5. 3 Exam Tips & High-Yield Mistakes to Avoid in Board/Entrance exams.

Provide your response in a valid JSON structure following the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the summary cheat sheet." },
            subject: { type: Type.STRING, description: "Subject name." },
            executiveSummary: { type: Type.STRING, description: "2-3 punchy sentences summarizing the core session purpose." },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5 to 7 key bullet point takeaways."
            },
            criticalFormulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 key formulas, equations, or definitions."
            },
            examTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 high-yield exam tips or common traps to avoid."
            }
          },
          required: ["title", "executiveSummary", "keyTakeaways", "criticalFormulas", "examTips"]
        }
      }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (err: any) {
    console.error("Lecture Summarizer Error:", err);
    res.status(500).json({ error: "Unable to summarize lecture at the moment. Please try again later." });
  }
});

app.post("/api/curriculum-lookup", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    });
  }
  const query = requireText(req.body?.query, 'Search query', 1000);
  const subject = requireText(req.body?.subject, 'Subject', 120) || 'General';
  const studentClass = requireText(req.body?.studentClass, 'Class', 40) || '6-12';
  if (!query) {
    return res.status(400).json({ error: 'Search query is required and must be 1-1000 characters.' });
  }

  try {
    const prompt = `You are an expert curriculum assistant for Class 6 to 12 subjects.
The teacher has queried: "${query}" for subject: "${subject || 'General'}" and Class: "${studentClass || '6-12'}".

Please provide a highly professional, accurate answer. Use Google Search grounding to ensure alignment with CBSE, ICSE, NCERT, and standard Indian school curriculum standards.
Include educational definitions, core equations, diagram descriptions, or relevant FAQs.
Keep the answer concise but comprehensive (around 2-3 short paragraphs), beautifully formatted in standard markdown.
At the end of the response, please list the relevant curriculum reference points if available.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const citations = chunks ? chunks.map((c: any) => ({
      title: c.web?.title || "Search Reference",
      uri: c.web?.uri || ""
    })).filter((c: any) => c.uri) : [];

    res.json({ answer: response.text, citations });
  } catch (err: any) {
    console.error("Curriculum Lookup Error:", err);
    res.status(500).json({ error: "Unable to complete curriculum lookup. Please try again." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
