import { Request, Response, NextFunction } from "express";
import axios from "axios";
import HttpError from "@utils/http-error";
import { GoogleGenerativeAI } from "@google/generative-ai";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;

export const getYoutubeTranscript = async (url: string): Promise<string> => {
  try {
    const videoId = extractVideoId(url);
    const options = {
      method: "GET",
      url: "https://youtube-transcriptor.p.rapidapi.com/transcript",
      params: {
        video_id: videoId,
        lang: "en",
      },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "youtube-transcriptor.p.rapidapi.com",
      },
    };
    const response = await axios.request(options);

    if (!response.data[0]) throw new Error("Transcript not found");

    return response.data[0].transcriptionAsText;
  } catch (error: any) {
    console.error("Error fetching transcript:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch transcript"
    );
  }
};

const extractVideoId = (url: string): string => {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);

  if (match && (match[1] || match[2])) {
    const videoId = match[1] || match[2];
    return videoId;
  }

  console.error("Invalid YouTube URL: Could not extract video ID");
  throw new Error("Invalid YouTube URL");
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
