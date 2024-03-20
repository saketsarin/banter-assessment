import { io } from 'socket.io-client';

const socket = io('http://localhost:6900');

export default socket;
