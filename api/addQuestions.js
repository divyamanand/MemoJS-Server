import { revision } from "../db/db.js";
import { qAddQuestion, qAddRevision, qQuestionExists } from "../db/queries.js";

const calculateRevisionDates = (difficulty, startDate) => {
    const k_vals = { hard: 1, medium: 1, easy: 2 };
    const c_vals = { hard: 1.3, medium: 1.7, easy: 2 };
    const iterations = { hard: 25, medium: 13, easy: 10 };

    const k = k_vals[difficulty.toLowerCase()];
    const c = c_vals[difficulty.toLowerCase()];
    const totalIterations = iterations[difficulty.toLowerCase()];

    const revisionDates = [];
    for (let index = 0; index < totalIterations; index++) {
        const day = Math.round(k * (c ** index));
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + day);
        newDate.setHours(0, 0, 0, 0);
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

            // Check if the question already exists
            const checkResult = await revision.query(qQuestionExists, [link]);
            const exists = checkResult.rows[0]?.exists;
            if (exists) continue;

            // Convert tags to comma-separated string
            const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

            // Insert new question
            const insertResult = await revision.query(qAddQuestion, [question, difficulty, tagsString, link]);
            const { id, added_on } = insertResult.rows[0];

            // Insert revisions
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

