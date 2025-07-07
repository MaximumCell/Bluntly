import express from "express"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";


import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"

import userRoutes from "./routes/user.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());


connectDB();

app.get("/", (req, res) => {
  res.send("Hello, World!")
});
app.use("/api/users", userRoutes);


app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`)
})