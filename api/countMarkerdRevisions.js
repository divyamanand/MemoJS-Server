import { revision } from "../db/db.js"
import { qCountCompleted } from "../db/queries.js"

const countMarkRevisions = async (req, res) => {
    try {
        const query = qCountCompleted
        const result = await revision.query(query)
        res.status(201).json({message: "Total completed revisions", response: result.rows[0]})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export {countMarkRevisions}