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

    // Extract video ID from YouTube URL
    const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL." });
    }

    // Step 1: Fetch Transcript using RapidAPI (YouTube Transcript API)
    const transcriptResponse = await axios.get(`https://youtube-transcript-api.p.rapidapi.com/v1/youtube/${videoId}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Add your RapidAPI key here
        'X-RapidAPI-Host': 'youtube-transcript-api.p.rapidapi.com',
      },
    });

    const transcript = transcriptResponse.data;

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ message: "Transcript not found." });
    }

    const transcriptText = transcript
      .map((item: { text: string }) => item.text)
      .join(" ");

    // Step 2: Summarize using Gemini API
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return next(new HttpError("API KEY not found!", 400));
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${transcriptText} Summarise into points.`;

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
    console.error(error);
    return next(new HttpError("Fetching youtube summary failed, try again!", 500));
  }
};
