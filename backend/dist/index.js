"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_error_1 = __importDefault(require("./utils/http-error"));
dotenv_1.default.config();
const url_controllers_1 = require("./url-controllers");
const LOCAL_HOST = process.env.LOCAL_HOST || 5050;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/youtube-url-summary", url_controllers_1.youtubeUrlResponse);
//Error showing if none of the routes found!
app.use((req, res, next) => {
    next(new http_error_1.default("Could not find this route.", 404));
});
//httperror middleware use here to return a valid json error instead any html error page
app.use((error, req, res, next) => {
    const statusCode = error.code || 500;
    const errorMessage = error.message || "An unknown error occurred!";
    const response = Object.assign({ message: errorMessage }, (error.extraData && { extraData: error.extraData }));
    res.status(statusCode).json(response);
});
app.listen(Number(LOCAL_HOST), () => {
    console.log(`Server is running on port ${LOCAL_HOST}`);
});
