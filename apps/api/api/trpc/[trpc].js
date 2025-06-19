import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../src/trpc/router.js";
import { createContext } from "../../src/trpc/context.js";
import express from "express";

const app = express();

// CORS configuration for production
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json());

// tRPC middleware
app.use(
  "/",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app; 