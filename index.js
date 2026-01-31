import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from "@google/genai"
import {fileURLToPath} from 'url'
import path from 'path'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const GEMINI_MODEL = "gemini-2.5-flash"

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

const PORT = 3000
app.listen(PORT, () => console.log(`Server ready on port${PORT}`))


app.post('/api/chat', async(req, res) => {
    const {conversation} = req.body;

    try {
        if(!Array.isArray(conversation)) throw new Error('Message must be an array!')
        
        const contents = conversation.map(({role, text}) => ({
            role,
            parts: [{ text: text }]
        }))    

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 1.5,
                systemInstruction: "Jawab hanya menggunakan bahasa indonesia"
            }
        })

        res.status(200).json({result: response.text})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})
