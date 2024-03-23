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
exports.getOpenAIChatCompletion = void 0;
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const openai = new openai_1.OpenAI({
    apiKey: OPENAI_API_KEY,
});
// define a simple interface for getting the next message in the chat.
function getOpenAIChatCompletion(personName, newMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        // define initial message as the system prompt for the celebrity
        const messages = [
            {
                role: 'system',
                content: `You are ${personName}. Do not write any explanations and only answer like  ${personName} would. 
      You must know all of the knowledge of ${personName}. Respond as ${personName} would, with wit and personality. Keep your responses within 1-2 sentences only.`,
            },
        ];
        // Add the user's message
        messages.push({
            role: 'user',
            content: newMessage,
        });
        // Get chat completion by sending all previous messages, including the latest one
        const chatCompletion = yield openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
        });
        return chatCompletion.choices[0].message.content || '';
    });
}
exports.getOpenAIChatCompletion = getOpenAIChatCompletion;
