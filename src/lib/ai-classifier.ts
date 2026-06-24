import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CATEGORIES = ["Course Data", "Assignments", "Quizzes"] as const;
const DEFAULT_CATEGORY = "Course Data";

/**
 * Uses Groq's LLaMA 3.1 8B to classify a document's text content
 * into one of the three categories: Course Data, Assignments, or Quizzes.
 * 
 * Falls back to "Course Data" if the AI fails or returns an invalid category.
 */
export async function classifyDocument(textContent: string): Promise<string> {
  // Truncate to first ~2000 chars (roughly first 2 pages)
  const truncated = textContent.substring(0, 2000);

  if (!truncated.trim()) {
    return DEFAULT_CATEGORY;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a document classifier for an academic document management system. 
Your job is to classify a document into exactly ONE of these categories based on its content:

1. "Course Data" - Lecture notes, syllabi, textbook excerpts, reference materials, study guides, course outlines
2. "Assignments" - Homework, lab reports, projects, essays, problem sets, take-home work, submissions
3. "Quizzes" - Quizzes, exams, tests, midterms, finals, practice questions, question papers, answer keys

Respond with ONLY the category name. Nothing else. No explanation, no punctuation, no quotes.`
        },
        {
          role: "user",
          content: `Classify this academic document:\n\n${truncated}`
        }
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";

    // Validate the response is one of the allowed categories
    const matched = CATEGORIES.find(
      cat => response.toLowerCase() === cat.toLowerCase()
    );

    return matched || DEFAULT_CATEGORY;
  } catch (error) {
    console.error("AI classification failed, defaulting to Course Data:", error);
    return DEFAULT_CATEGORY;
  }
}

/**
 * Extract text from a PDF buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    return "";
  }
}
