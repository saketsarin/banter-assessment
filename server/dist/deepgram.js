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
exports.getDeepgramLiveConnection = void 0;
const sdk_1 = require("@deepgram/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let keepAlive;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '';
function getDeepgramLiveConnection(transcriptReceivedEventHandler) {
    if (!DEEPGRAM_API_KEY) {
        console.error('Deepgram API key is missing.');
        return null;
    }
    // Instantiate Deepgram object with the API key
    const deepgram = new sdk_1.Deepgram(DEEPGRAM_API_KEY);
    const deepgramLive = deepgram.transcription.live({
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        smart_format: true,
    });
    // Clear keepAlive if it's been set, and restart it
    function clearKeepAlive() {
        if (keepAlive)
            clearInterval(keepAlive);
    }
    clearKeepAlive();
    keepAlive = setInterval(() => {
        deepgramLive.keepAlive();
    }, 10 * 1000);
    // Add event listeners for open, close, and error
    deepgramLive.addListener('open', () => __awaiter(this, void 0, void 0, function* () {
        console.log('Deepgram: connected');
        deepgramLive.addListener('close', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log('Deepgram: disconnected');
            clearInterval(keepAlive);
            deepgramLive.finish();
        }));
        deepgramLive.addListener('error', (error) => __awaiter(this, void 0, void 0, function* () {
            console.log('Deepgram: error received');
            console.error(error);
        }));
    }));
    // Add event listener for transcriptReceived - passed in by caller
    deepgramLive.addListener('transcriptReceived', transcriptReceivedEventHandler);
    return deepgramLive;
}
exports.getDeepgramLiveConnection = getDeepgramLiveConnection;
