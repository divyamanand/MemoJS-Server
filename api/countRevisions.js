import { revision } from "../db/db.js"
import { qCountRevisions } from "../db/queries.js"


const countRevisions = async (req, res) => {
    const {question_id} = req.body

    try {
        const countRevisions = qCountRevisions
        const {rows} = await revision.query(countRevisions, [question_id])
        const totalRevisions = rows[0] || 0
        return res.status(201).send({totalRevisions: totalRevisions})
    } catch (error) {
        return res.status(500).send({message: "Failed to count", error})
    }
}

export {countRevisions}