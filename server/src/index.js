import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Database Connection
app.get("/", async (req, res) => {
    const result = await pool.query('SELECT current_database()');
    res.send(`Connected to the database: ${result.rows[0].current_database}`);
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server only in non-Vercel environments
if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
}

export default app;
