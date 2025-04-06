const qListQuestions = `
    SELECT q.id, q.question, q.tags, q.difficulty, q.last_revised, q.link
    FROM questions q
    WHERE q.added_on::DATE = CURRENT_DATE
    ORDER BY q.added_on DESC;
`

const qUpdateRevisions = `
    UPDATE revisions
    SET revision_date = CURRENT_DATE
    WHERE revision_date < CURRENT_DATE AND completed = FALSE;
`

const qQuestionExists = `
    SELECT EXISTS (
    SELECT 1 FROM questions WHERE LOWER(link) = LOWER($1)
    )
`

const qAddQuestion = `
    INSERT INTO questions (question, difficulty, tags, link)
    VALUES ($1, $2, $3, $4)
    RETURNING id, question, link, added_on;

`

const qAddRevision = `
    INSERT INTO revisions (question_id, revision_date)
    VALUES ($1, $2)
    RETURNING id, question_id, revision_date;
`

const qRemoveQuestion = ` 
    DELETE FROM revisions WHERE question_id = $1;
    DELETE FROM questions WHERE id = $1;
`

const qTodayRevisions = `
    SELECT 
        r.id AS revision_id, 
        q.id AS question_id, 
        q.question, 
        q.tags, 
        r.revision_date, 
        r.completed,
        q.last_revised,
        q.link
    FROM 
        questions q
    JOIN 
        revisions r ON q.id = r.question_id
    WHERE 
        r.revision_date = CURRENT_DATE 
    ORDER BY 
        r.id;
`;


const qUpcomingRevisions = `
    SELECT q.id, q.question, q.tags, r.revision_date FROM questions q
    JOIN revisions r ON q.id = r.question_id
    WHERE r.completed = FALSE AND r.revision_date > CURRENT_DATE
    ORDER BY r.revision_date;
`

const qMarkRevisionDone = `
    UPDATE revisions 
    SET completed = NOT completed
    WHERE id = $1 
    AND revision_date <= CURRENT_DATE
    RETURNING id, revision_date, completed;
`

const qDeleteRevision = `
    DELETE FROM revisions 
    WHERE question_id = $1;
`

const qChangeQuestionDifficulty = `
    UPDATE questions 
    SET difficulty = $1 
    WHERE id = $2;
`
export { 
    qListQuestions,
    qUpdateRevisions,
    qQuestionExists,
    qAddQuestion,
    qRemoveQuestion,
    qTodayRevisions,
    qUpcomingRevisions,
    qMarkRevisionDone,
    qDeleteRevision,
    qChangeQuestionDifficulty,
    qAddRevision
}