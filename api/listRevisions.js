import { revision } from "../db/db.js"
import { qTodayRevisions, qUpdateRevisions } from "../db/queries.js"

const listRevisions = async (req, res) => {
    try {
        const updateRevisionQuery = qUpdateRevisions
        await revision.query(updateRevisionQuery)
        const query = qTodayRevisions
        const result = await revision.query(query)
        res.status(201).send({message: "List of Revisions", totalQuestions: result.rows.length, response: result.rows})
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

export {listRevisions}