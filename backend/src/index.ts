import "module-alias/register";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import HttpError from "./utils/http-error";
dotenv.config();
import { youtubeUrlResponse } from "./url-controllers";

const LOCAL_HOST = process.env.LOCAL_HOST || 5050;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.post("/api/get-summary", youtubeUrlResponse);

//Error showing if none of the routes found!
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new HttpError("Could not find this route.", 404));
});

//httperror middleware use here to return a valid json error instead any html error page
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.code || 500;
  const errorMessage = error.message || "An unknown error occurred!";

  const response = {
    message: errorMessage,
    ...(error.extraData && { extraData: error.extraData }),
  };

  res.status(statusCode).json(response);
});

app.listen(Number(LOCAL_HOST), () => {
  console.log(`Server is running on port ${LOCAL_HOST}`);
});
