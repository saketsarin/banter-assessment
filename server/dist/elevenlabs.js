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
exports.getElevenLabsAudio = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ELEVEN_LABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
function getElevenLabsAudio(text, voice_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const elevenLabsTextToSpeechURL = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream?optimize_streaming_latency=1`;
        const headers = {
            accept: 'audio/mpeg',
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
        };
        const response = yield fetch(elevenLabsTextToSpeechURL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                text,
            }),
        });
        return response.arrayBuffer();
    });
}
exports.getElevenLabsAudio = getElevenLabsAudio;
