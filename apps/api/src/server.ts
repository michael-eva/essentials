import express, { Request, Response } from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "@essentials/trpc";
import dotenv from "dotenv";
import { appRouter } from "./trpc/root";

// Load .env from root directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Web app (dev)
      "http://localhost:3001", // API itself
      "capacitor://localhost", // Capacitor
      "ionic://localhost", // Ionic
      process.env.WEB_APP_URL, // Production web app URL
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined, // Vercel preview deployments
    ].filter((origin): origin is string => Boolean(origin)),
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// tRPC middleware
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter as any,
    createContext,
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});
