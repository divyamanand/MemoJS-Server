import { revision } from "../db/db.js";
import { qAddQuestion, qAddRevision, qQuestionExists } from "../db/queries.js";

const calculateRevisionDates = (difficulty, startDate) => {
    const iterations = { easy: 2, medium: 3, hard: 4 };
    const totalIterations = iterations[difficulty.toLowerCase()];

    const revisionDates = [];
    const start = new Date(startDate);
    const end = new Date('2025-12-31');

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const interval = Math.floor(totalDays / (totalIterations + 1));

    for (let i = 1; i <= totalIterations; i++) {
        const newDate = new Date(start);
        newDate.setDate(start.getDate() + i * interval);
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

