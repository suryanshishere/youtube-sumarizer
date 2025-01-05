"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeUrlResponse = void 0;
const youtube_transcript_1 = require("youtube-transcript");
const http_error_1 = __importDefault(require("./utils/http-error"));
const generative_ai_1 = require("@google/generative-ai");
const youtubeUrlResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { youtubeUrl } = req.body;
        if (!youtubeUrl) {
            return res.status(400).json({ message: "YouTube URL is required." });
        }
        const transcript = yield youtube_transcript_1.YoutubeTranscript.fetchTranscript(youtubeUrl);
        const transcriptText = transcript
            .map((item) => item.text)
            .join(" ");
        if (!transcriptText) {
            return res.status(404).json({ message: "Transcript not found." });
        }
        //using gemini instead of chatgpt because my chatgpt api token has being expired
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            return next(new http_error_1.default("API KEY not found!", 400));
        }
        // Step 2: Summarize using Gemini API
        const genAI = new generative_ai_1.GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${transcriptText} Summarise into points.`;
        const result = yield model.generateContent(prompt);
        if (!result) {
            return next(new http_error_1.default("No prompt result received!", 400));
        }
        const summaryText = result.response.text();
        if (!summaryText) {
            return res.status(500).json({ message: "Error in generating summary." });
        }
        res.status(200).json({
            message: "Transcript summarized successfully!",
            summary: summaryText,
        });
    }
    catch (error) {
        return next(new http_error_1.default("Fetching youtube summary failed, try again!", 500));
    }
});
exports.youtubeUrlResponse = youtubeUrlResponse;
