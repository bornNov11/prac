const socket = io();

const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const roomIdInput = document.getElementById('room-id');
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const userCountDiv = document.getElementById('user-count');

let currentRoom = null;

createBtn.addEventListener('click', () => {
    fetch('/create-room')
        .then(response => response.json())
        .then(data => {
            currentRoom = data.roomId;
            joinRoom(currentRoom);
            alert(`방이 생성되었습니다. 방 ID: ${currentRoom}`);
        });
});

joinBtn.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (roomId) {
        currentRoom = roomId;
        joinRoom(currentRoom);
    } else {
        alert('방 ID를 입력해주세요.');
    }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function joinRoom(roomId) {
    socket.emit('join-room', roomId);
    document.getElementById('create-room').style.display = 'none';
    document.getElementById('join-room').style.display = 'none';
    chatContainer.style.display = 'block';
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        socket.emit('chat-message', currentRoom, message);
        messageInput.value = '';
    }
}

socket.on('chat-message', (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user-joined', (userCount) => {
    userCountDiv.textContent = `참가자 수: ${userCount}`;
});

socket.on('user-left', (userCount) => {
    userCountDiv.textContent = `참가자 수: ${userCount}`;
});