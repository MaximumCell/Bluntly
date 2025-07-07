import express from "express"
import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"

const app = express()
connectDB();

app.get("/", (req, res) => {
  res.send("Hello, World!")
})

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`)
})