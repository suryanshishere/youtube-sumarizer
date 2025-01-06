import { Request, Response, NextFunction } from "express";
import axios from "axios";
import HttpError from "@utils/http-error";
import { GoogleGenerativeAI } from "@google/generative-ai";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!;
const API_URL = `https://${RAPIDAPI_HOST}`;
  

export const getYoutubeTranscript = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/transcript`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      params: {
        url: url,
      },
    });

    const transcript = response.data.transcript;
    if (!transcript) throw new Error('Transcript not found');

    return transcript;
  } catch (error: any) {
    console.error('Error fetching transcript:', error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch transcript');
  }
};
const summarizeTranscript = async (
  transcript: string,
  apiKey: string
): Promise<string> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `${transcript} Summarise into points.`;
  const result = await model.generateContent(prompt);
  return result.response?.text() ?? "No summary generated.";
};

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

    const transcript = await getYoutubeTranscript(youtubeUrl);

    const summary = await summarizeTranscript(
      transcript,
      process.env.GEMINI_API_KEY!
    );

    res.status(200).json({
      message: "Transcript summarized successfully!",
      summary,
    });
  } catch (error) {
    console.error(error);
    return next(
      new HttpError("Fetching YouTube summary failed, try again!", 500)
    );
  }
};
