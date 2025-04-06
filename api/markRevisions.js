import { revision } from "../db/db.js"
import { qMarkRevisionDone } from "../db/queries.js"


const markRevisions = async (req, res) => {
    const revisionIds = req.body.ids

    if (!Array.isArray(revisionIds) || revisionIds.length == 0) {
        return res.status(400).send("No revisions found")
    }

    try {
        const revisions = []

        for (const id of revisionIds) {
            const query = qMarkRevisionDone
            const result = await revision.query(query, [id])
            revisions.push(...result.rows)
        }
        return res.status(201).send({message: "Revisions Marked Done", response: revisions})
    } catch (error) {
        return res.status(500).send(error)
    }
}

export {markRevisions}