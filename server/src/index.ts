import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import connectDB from "./config/database.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { errorHandel } from "./middleware/errormiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/incidents", incidentRoutes);
app.get("/", (req: Request, res: Response) => {
  console.log("Welcome to Sentinel API");
  res.json({ message: "Welcome to Sentinel EWS API" }); // browser में दिखने के लिए
});
app.use(errorHandel);

//socket.io setup
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("📡 Device Connected:", socket.id);
});

//making app listen
app.listen(PORT, () => {
  console.log(`🚀 Server is connected on port ${PORT}`);
});
