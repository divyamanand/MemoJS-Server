import { revision } from "../db/db.js";
import { qAddQuestion, qAddRevision, qQuestionExists } from "../db/queries.js";

const calculateRevisionDates = (difficulty, startDate) => {
    const c_vals = { hard: 1.35, medium: 1.57, easy: 1.65 };
    const iterations = { hard: 7, medium: 5, easy: 3 };
  
    difficulty = difficulty.toLowerCase();
  
    const c = c_vals[difficulty];
    const totalIterations = iterations[difficulty];
  
    // Fixed end date: 1 Jan 2026 (exclusive)
    const endDate = new Date('2026-01-01T00:00:00');
  
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  
    // Calculate total days between start and end
    const diffTime = endDate - start;
    if (diffTime <= 0) {
      throw new Error('Start date must be before 1 Jan 2026');
    }
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    // Calculate k so that the last revision happens <= totalDays
    const k = totalDays / (c ** (totalIterations - 1));
  
    const revisionDates = [];
    for (let i = 0; i < totalIterations; i++) {
      const dayOffset = Math.round(k * (c ** i));
      const newDate = new Date(start);
      newDate.setDate(newDate.getDate() + dayOffset);
      revisionDates.push(newDate);
    }
    return revisionDates;
  };
  


const addQuestions = async (req, res) => {
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).send("No question found");
    }

    try {
        const quests = [];
        for (const quest of questions) {
            const { question, difficulty, tags, link } = quest;
            if (!question || !difficulty) {
                return res.status(400).send(`Incomplete Question Info: ${JSON.stringify(quest)}`);
            }

            const checkResult = await revision.query(qQuestionExists, [link]);
            const exists = checkResult.rows[0]?.exists;
            if (exists) continue;

            const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

            const insertResult = await revision.query(qAddQuestion, [question, difficulty, tagsString, link]);
            const { id, added_on } = insertResult.rows[0];


            const revisionDates = calculateRevisionDates(difficulty, added_on);
            const revisions = [];
            for (const date of revisionDates) {
                const r = await revision.query(qAddRevision, [id, date]);
                revisions.push(r.rows[0]);
            }

            quests.push({ question, revisions });
        }

        res.status(201).json({ message: "Questions and revisions added successfully", totalQuestions: quests.length, quests });
    } catch (error) {
        res.status(500).send(`Some error has occurred: ${error.message}`);
    }
};

export { addQuestions };

