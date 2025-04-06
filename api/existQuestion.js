import { revision } from "../db/db.js"
import { qQuestionExists } from "../db/queries.js"

const existQuestion = async (req, res) => {
    const question = req.query.quest

    if (!question) {
        return res.status(400).send(`Incomplete Question Info`, $JSON.Stringify(question))
    }

    try {
        const query = qQuestionExists
        const values = [question]

        const result = await revision.query(query, values)
        const exist = result.rows[0]?.exists
        if (exist) {
            //return res.status(200).json({message: "Question Exist", response: true})
            return res.status(200).send({message: "Question Exist", response: true})
        } else {
            return res.status(400).send({message: "Question Does Not Exist", response: false})
        }
    } catch (error) {
        res.status(500).send(`Some error has been occured ${error}`)
    }

}

export {existQuestion}