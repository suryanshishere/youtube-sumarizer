import { Request, Response, NextFunction } from "express";
import { YoutubeTranscript } from "youtube-transcript";
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

    const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
    const transcriptText = transcript
      .map((item: { text: string }) => item.text)
      .join(" ");

    if (!transcriptText) {
      return res.status(404).json({ message: "Transcript not found." });
    }

    //using gemini instead of chatgpt because my chatgpt api token has being expired
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return next(new HttpError("API KEY not found!", 400));
    }

    // Step 2: Summarize using Gemini API
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
    return next(
      new HttpError("Fetching youtube summary failed, try again!", 500)
    );
  }
};
