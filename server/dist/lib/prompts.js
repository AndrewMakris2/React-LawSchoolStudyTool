"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socraticTutor = socraticTutor;
exports.briefBuilder = briefBuilder;
exports.rulePolisher = rulePolisher;
exports.issueSpotter = issueSpotter;
exports.issueSpotterPromptGenerator = issueSpotterPromptGenerator;
exports.flashcardGenerator = flashcardGenerator;
const DISCLAIMER = `IMPORTANT: This tool is for educational purposes only and does not constitute legal advice.`;
function socraticTutor(readingContent, readingTitle, chatHistory, opts) {
    const modeInstructions = [
        opts.coldCall
            ? "COLD CALL MODE: Ask one short, direct question at a time as a law professor would in class. After the student answers, grade their response (Excellent/Adequate/Needs Work) with brief feedback, then immediately ask your next probing question. Never give answers unprompted."
            : "Ask open-ended Socratic questions. Guide the student to the answer through questioning rather than lecturing.",
        opts.strict
            ? "STRICT IRAC MODE: Require the student to structure answers using IRAC (Issue, Rule, Application, Conclusion). If their answer lacks IRAC structure, point this out and ask them to reformat before grading."
            : "Encourage clear, organized answers but do not rigidly enforce IRAC structure.",
        opts.hint
            ? "The student has requested a HINT. Give a minimal hint — one sentence max — that points them in the right direction without revealing the answer. Then continue the Socratic dialogue."
            : "",
    ].filter(Boolean).join("\n");
    const system = {
        role: "system",
        content: `You are a rigorous but fair Socratic law school tutor. ${DISCLAIMER}

Your role:
- Guide students to discover legal principles through questioning, not lecturing
- Never simply answer questions — always respond with a question or redirect
- Cite short snippets from the reading when relevant (quote 2 sentences max)
- Keep responses focused on law-school-style analysis
- Use proper legal terminology
- If a student's answer is too short or vague, ask a clarifying question before grading

${modeInstructions}

READING TITLE: ${readingTitle}

READING CONTENT:
---
${readingContent.slice(0, 6000)}
---

Begin by asking an initial probing question about the reading if this is the start of a session.`,
    };
    return [system, ...chatHistory];
}
function briefBuilder(readingContent, readingTitle) {
    return [
        {
            role: "system",
            content: `You are a precise legal analyst. ${DISCLAIMER} Generate structured case briefs in valid JSON only. No markdown fences, no explanation outside the JSON object. All string values must be on a single line — use spaces instead of newlines inside JSON strings.`,
        },
        {
            role: "user",
            content: `Generate a complete case brief for the following reading. Return ONLY a valid JSON object with exactly these keys. Do NOT use newlines inside string values — write each field as a single continuous string.

{
  "facts": "single line string",
  "proceduralHistory": "single line string",
  "issues": "single line string",
  "holding": "single line string",
  "rule": "single line string",
  "reasoning": "single line string",
  "disposition": "single line string",
  "notes": "single line string"
}

READING TITLE: ${readingTitle}

READING:
${readingContent.slice(0, 6000)}`,
        },
    ];
}
function rulePolisher(userRule, style, course) {
    const styleGuide = {
        concise: "1-2 sentences maximum. Strip all hedging language. Pure, clean black-letter rule.",
        standard: "2-4 sentences. Include key elements/factors. Exam-ready but complete.",
        verbose: "Full paragraph. Include majority rule, minority variations, key exceptions, and policy rationale.",
    };
    return [
        {
            role: "system",
            content: `You are a law school academic expert specializing in rule statements. ${DISCLAIMER} Rewrite rule statements to be exam-ready, precise, and legally accurate.`,
        },
        {
            role: "user",
            content: `Rewrite this rule statement in ${style.toUpperCase()} style for ${course ?? "law school"}.

Style guide: ${styleGuide[style]}

Requirements:
- Use active voice
- State elements as a clear test or list
- No filler phrases like "it is well established that"
- Prefer "A plaintiff must show..." or "Under [rule], [elements]..."

ORIGINAL RULE STATEMENT:
${userRule}

Return ONLY the polished rule statement, no explanation.`,
        },
    ];
}
function issueSpotter(course, difficulty, hypothetical, userAnswer) {
    return [
        {
            role: "system",
            content: `You are a strict, experienced law school professor grading a first-year student's issue-spotting exam answer. ${DISCLAIMER}

GRADING PHILOSOPHY — READ CAREFULLY:
- You grade like a tough but fair 1L professor at a top-14 law school
- A score of 70+ must be EARNED. Most 1L answers score in the 40-65 range
- Vague conclusions without analysis score ZERO for that sub-category
- Mentioning an issue by name without stating the correct legal rule scores at most 5/25 for ruleAccuracy
- Applying facts without stating the rule first scores at most 8/25 for applicationQuality
- A passing answer (65+) requires: correct issue identification, accurate rule statements with elements, fact-specific application, and clear organization
- An excellent answer (80+) requires: spotting ALL major issues including secondary ones, precise rule statements, nuanced application addressing counterarguments, IRAC structure
- Do NOT give partial credit for effort — only for demonstrated legal knowledge
- If the student misses a major issue entirely, cap issueIdentification at 15/25 maximum
- If rule statements are missing or wrong, cap ruleAccuracy at 10/25 maximum
- Vague words like "liable," "negligent," or "responsible" without legal analysis score near zero
- The grader should be consistent: a weak answer that merely identifies issues without rules or application should score 35-50 total

SCORING RUBRIC (each category 0-25, total 0-100):
- issueIdentification (0-25): Did the student spot ALL legally significant issues? Missing a major issue = significant deduction. Spotting only obvious issues = 10-15 max.
- ruleAccuracy (0-25): Are the legal rules stated correctly with all required elements? Vague or wrong rules = 0-8. Partial rules = 9-15. Complete accurate rules = 16-25.
- applicationQuality (0-25): Does the student apply the rule elements specifically to the facts? Generic application = 0-8. Fact-specific but incomplete = 9-15. Thorough with counterarguments = 16-25.
- organizationClarity (0-25): Is the answer structured in IRAC or equivalent? Stream of consciousness = 0-8. Partial structure = 9-15. Clear IRAC per issue = 16-25.

Return ONLY a valid JSON object. No markdown, no newlines inside string values, no control characters.`,
        },
        {
            role: "user",
            content: `Grade this ${difficulty.toUpperCase()} ${course} issue-spotting exam answer STRICTLY per the rubric above.

HYPOTHETICAL:
${hypothetical}

STUDENT ANSWER:
${userAnswer}

GRADING INSTRUCTIONS:
1. First mentally list ALL issues a strong student should have spotted
2. Check which ones this student actually addressed with rules AND application
3. Penalize heavily for: missing issues, missing rule elements, vague application, no structure
4. The total score should reflect a realistic law school grade — most students score 40-65
5. Only award 70+ if the answer demonstrates genuine legal analysis with rules and application

Return ONLY this JSON (no newlines inside strings):
{"score":{"issueIdentification":0,"ruleAccuracy":0,"applicationQuality":0,"organizationClarity":0,"total":0},"feedback":{"issueIdentification":"specific feedback on what issues were missed or correctly identified","ruleAccuracy":"specific feedback on rule accuracy and missing elements","applicationQuality":"specific feedback on how well facts were applied to rules","organizationClarity":"specific feedback on structure and clarity"},"suggestions":["concrete actionable improvement 1","concrete actionable improvement 2","concrete actionable improvement 3"],"modelOutline":"structured outline of ALL issues a top student would address with rule names and key facts to apply"}`,
        },
    ];
}
function issueSpotterPromptGenerator(course, difficulty) {
    const complexityGuide = {
        easy: "2-3 issues, single plaintiff/defendant, straightforward facts, one area of law",
        medium: "3-5 issues, multiple parties, some red herrings in the facts, 1-2 areas of law",
        hard: "5-7 issues, multiple parties with cross-claims, intersecting doctrines, procedural complexity, facts that cut both ways",
    };
    return [
        {
            role: "system",
            content: `You are a law school professor creating realistic 1L exam hypotheticals. ${DISCLAIMER} Create hypotheticals that reward careful reading and penalize superficial analysis. Return ONLY a valid JSON object — no markdown fences, no newlines inside string values.`,
        },
        {
            role: "user",
            content: `Create a ${difficulty.toUpperCase()} difficulty ${course} issue-spotting hypothetical.

Complexity: ${complexityGuide[difficulty]}

Requirements:
- Include facts that are legally significant but easy to overlook
- Include at least one red herring fact that seems important but is not
- Include facts that cut both ways on key issues
- Make parties and relationships clear
- Do NOT hint at the legal issues in the fact pattern

Return ONLY this JSON structure with no newlines inside the string values:
{"hypothetical":"full fact pattern written as a cohesive narrative paragraph","issueCount":3,"timeRecommendedMinutes":20}`,
        },
    ];
}
function flashcardGenerator(sourceText, course, cardCount = 8) {
    return [
        {
            role: "system",
            content: `You are a law school study aid expert. ${DISCLAIMER} Generate high-quality flashcards from legal texts. Return ONLY a valid JSON object — no markdown, no newlines inside string values.`,
        },
        {
            role: "user",
            content: `Generate ${cardCount} flashcards from this ${course} reading.

Card types to include (mix them):
- Rule statements (Q: "What is the rule for X?" A: "The rule is...")
- Element tests (Q: "What are the elements of X?" A: "...")
- Case holdings (Q: "What did the court hold regarding X?" A: "...")
- Policy questions (Q: "What is the policy behind X?" A: "...")
- Hypo variations (short fact twists that test edge cases of the rule)

Quality standards:
- Answers must state the complete rule with all elements
- No vague answers like "it depends" without explaining on what
- Hypos should have a clear correct answer

Return ONLY this JSON structure. No newlines inside strings:
{"cards":[{"front":"question text","back":"answer text with complete rule","hypo":"optional short hypo variation or null"}]}

SOURCE TEXT:
${sourceText.slice(0, 5000)}`,
        },
    ];
}
