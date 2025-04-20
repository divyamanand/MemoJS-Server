import { revision } from "../db/db.js"
import { qCountCompleted, qDecreaseRevisions } from "../db/queries.js"

const decreaseRevisions = async( req, res) => {
    const questionID = req.body

    try { 

        const count = await revision.query(qCountCompleted, [questionID])

        if (count >= 7) {
            await revision.query(qDecreaseRevisions, [questionID])
            return res.status(201).send({message: "Revisions deleted successfully"})
        } else {
            return res.status(401).send({message: "You don't have sufficient number of revisions"})
        }
        
    } catch (error) {
        return res.status(501).send({message: "Something went wrong", error})
    }
}

export {decreaseRevisions}