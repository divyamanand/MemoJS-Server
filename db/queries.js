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

const qCountCompleted = `
    SELECT COUNT(*) 
    FROM revisions 
    WHERE completed = true
    AND DATE(revision_date) = CURRENT_DATE;
`

const qCountRevisions = `
    SELECT COUNT(*) AS completed_count
    FROM revisions
    WHERE question_id = $1
    AND completed = true;
`

const qDecreaseRevisions = `
  WITH numbered AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY revision_date, id) AS rn
    FROM revisions
    WHERE completed = false
      AND revision_date >= CURRENT_DATE
      AND revision_date <= CURRENT_DATE + INTERVAL '7 days'
      AND question_id = $1
  ),
  to_delete AS (
    SELECT id
    FROM numbered
    WHERE rn % 2 = 0
  )
  DELETE FROM revisions
  WHERE id IN (SELECT id FROM to_delete);
`

const qIncreaseRevisions = `
    WITH date_series AS (
        SELECT CURRENT_DATE + INTERVAL '1 day' * generate_series(0, 6) AS revision_date
    ),
    numbered_dates AS (
        SELECT 
            revision_date,
            ROW_NUMBER() OVER () AS row_num
        FROM date_series
    )
    INSERT INTO revisions (question_id, revision_date, completed)
    SELECT 
        $1 AS question_id,  -- Use your specific question_id
        revision_date, 
        FALSE AS completed
    FROM numbered_dates
    WHERE row_num % 2 = 0;
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
    qAddRevision,
    qCountCompleted,
    qCountRevisions,
    qDecreaseRevisions,
    qIncreaseRevisions
}