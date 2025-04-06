import { revision } from "../db/db.js"
import { qListQuestions } from "../db/queries.js"

const listQuestions = async (req, res) => {
    try {
        const query = qListQuestions
        const result = await revision.query(query)
        res.status(201).json({message: "List of Questions", response: result.rows})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}


export {listQuestions}