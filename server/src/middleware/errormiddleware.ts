import { Request, Response, NextFunction } from "express";

export const errorHandel = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`❌ Error: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show the stack trace if we are in development mode
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
