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
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const deepgram_1 = require("./deepgram");
const openai_1 = require("./openai");
const elevenlabs_1 = require("./elevenlabs");
dotenv_1.default.config();
const server = http_1.default.createServer();
const socketIOServer = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
    },
});
let clientSocket;
let personName = '';
let voice_id = '';
socketIOServer.on('connection', (socket) => {
    console.log('*******client connected');
    clientSocket = socket;
    // Send initial message from the celebrity once the client connects
    // const initialMessage = `Hello, I am ${personName}. Let's start our conversation.`;
    // clientSocket.emit('celebritySpeaking', initialMessage);
    // after connection, an event is emitted to the client to get the person's name and voice_id
    socket.on('getDetails', (data) => {
        personName = data.personName;
        voice_id = data.voice_id;
    });
    socket.on('packet-sent', (data) => {
        const readyState = deepgramLive === null || deepgramLive === void 0 ? void 0 : deepgramLive.getReadyState();
        if (readyState === 1) {
            deepgramLive === null || deepgramLive === void 0 ? void 0 : deepgramLive.send(data);
        }
        else {
            console.log(`socket: data couldn't be sent to deepgram. readyState was ${readyState}`);
        }
    });
    socket.on('disconnect', () => {
        console.log('socket: client disconnected');
    });
});
server.listen(process.env.PORT, () => {
    console.log(`server listening on port ${process.env.PORT}`);
});
const deepgramLive = (0, deepgram_1.getDeepgramLiveConnection)((data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`transcript received`);
    const transcriptData = JSON.parse(data);
    if (transcriptData.type !== 'Results') {
        return;
    }
    const transcript = (_a = transcriptData.channel.alternatives[0].transcript) !== null && _a !== void 0 ? _a : '';
    if (transcript) {
        console.log(`transcript received: "${transcript}"`);
        const openAIResponse = yield (0, openai_1.getOpenAIChatCompletion)(personName, transcript);
        console.log(`openAIResponse: ${openAIResponse}`);
        const elevenLabsAudio = yield (0, elevenlabs_1.getElevenLabsAudio)(openAIResponse, voice_id);
        if (!clientSocket.connected) {
            console.log('socket: client not connected');
        }
        if (clientSocket) {
            clientSocket.emit('audioData', elevenLabsAudio);
            console.log('sent audio data to frontend: ', elevenLabsAudio);
            // Allow user to speak after celebrity's message is received
            setTimeout(() => {
                clientSocket.emit('celebritySpeaking', true);
            }, 5000);
        }
    }
}));
exports.default = server;
