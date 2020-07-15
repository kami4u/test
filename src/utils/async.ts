import { Request, Response, NextFunction } from "express";
// wrap async route handlers with this to allow catch all error handling
export const asyncRoute = (f: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(f(req, res, next)).catch(next);
};
