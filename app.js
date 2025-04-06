
import "dotenv/config"
import express from "express"
import cors from "cors"
import { listQuestions } from "./api/listQuestions.js"
import { existQuestion } from "./api/existQuestion.js"
import { addQuestions } from "./api/addQuestions.js"
import { listRevisions } from "./api/listRevisions.js"
import { markRevisions } from "./api/markRevisions.js"


const app = express()
const port = process.env.PORT || 8000

app.use(cors({origin: true, credentials: true}))
app.use(express.json())

app.listen(port, () => console.log(`App listening on port ${port}`))
app.get("/", (req, res) => res.send("Check the revision plan"))
app.get("/list-questions", listQuestions)
app.get("/check-question", existQuestion)
app.get("/list-revisions", listRevisions)
app.post("/mark-revisions", markRevisions)
app.post("/add-questions", addQuestions)

