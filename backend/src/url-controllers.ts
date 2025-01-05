import { Request, Response, NextFunction } from "express";
import axios from "axios";
import HttpError from "@utils/http-error";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const youtubeUrlResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ message: "YouTube URL is required." });
    }

    // Extract video ID from the URL
    const videoId = youtubeUrl.split("v=")[1].split("&")[0];

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return next(new HttpError("YouTube API Key not found!", 400));
    }

    const captionResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions`,
      {
        params: {
          part: "snippet",
          videoId,
          key: apiKey,
        },
      }
    );

    if (
      !captionResponse.data.items ||
      captionResponse.data.items.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "No captions found for the video." });
    }

    const captionId = captionResponse.data.items[0].id;

    const transcriptResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}`,
      {
        params: {
          key: apiKey,
        },
        responseType: "text",
      }
    );

    const transcriptText = transcriptResponse.data;

    if (!transcriptText) {
      return res.status(404).json({ message: "Transcript not found." });
    }
    
    //using gemini instead of chatgpt cuz my api has being exhausted!
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return next(new HttpError("API KEY not found!", 400));
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${transcriptText} Summarize into points.`;

    const result = await model.generateContent(prompt);
    if (!result) {
      return next(new HttpError("No prompt result received!", 400));
    }

    const summaryText = result.response.text();

    if (!summaryText) {
      return res.status(500).json({ message: "Error in generating summary." });
    }

    res.status(200).json({
      message: "Transcript summarized successfully!",
      summary: summaryText,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Fetching YouTube summary failed, try again!", 500)
    );
  }
};
