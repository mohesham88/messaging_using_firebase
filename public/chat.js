
const firebaseConfig = {
    apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
    authDomain: "labtask2-cb64c.firebaseapp.com",
    databaseURL: "https://labtask2-cb64c-default-rtdb.firebaseio.com/",
    projectId: "labtask2-cb64c",
    storageBucket: "labtask2-cb64c.firebasestorage.app",
    messagingSenderId: "230466244503",
    appId: "1:230466244503:web:b99864da1301b2b601bed2"
  };

firebase.initializeApp(firebaseConfig);

// Realtime Database reference
const db = firebase.database();
const auth = firebase.auth();

// Channel List
const channelList = document.getElementById('channel-list-ul');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');
const leaveChatButton = document.getElementById('leave-chat-button');
const messagesContainer = document.getElementById('messages');
const chatContainer = document.getElementById('nano-content pad-all');
let currentChannelName = localStorage.getItem('channelName');
let currentUserName = localStorage.getItem('userName');
// Load Messages for a Channel
const loadMessages = async (currentChannelName) => {
    const messagesContainer = document.getElementById('messages'); // Select the messages container
    messagesContainer.innerHTML = ''; // Clear messages
    currentUserId = localStorage.getItem('userId');
    currentChannelName = currentChannelName;
    const channelRef = db.ref(`channels/${currentChannelName}/messages`);
    document.getElementById('chat-room-title').textContent = `Chat Room: ${currentChannelName}`;
    const messageInput = document.getElementById('message-input'); 
    const sendMessageButton = document.getElementById('send-message-button'); 
    if (messageInput && sendMessageButton) {
        messageInput.disabled = false;
        sendMessageButton.disabled = false;
    }
    // Load messages in the chat room
    channelRef.on('child_added', (snapshot) => {
        const messageData = snapshot.val();
        const senderId = messageData.sender; 
        const senderName = messageData.senderName; 
        const message = messageData.message;
        const isCurrentUser = senderId === currentUserId;
        const messageLi = document.createElement('li');
        messageLi.classList.add('mar-btm');

        // Add message content
        const mediaBodyDiv = document.createElement('div');
        if (isCurrentUser) {
            mediaBodyDiv.classList.add('media-body', 'pad-hor', 'speech-right');
        } else {
            mediaBodyDiv.classList.add('media-body', 'pad-hor');
        }
        mediaBodyDiv.innerHTML = `
            <div class="speech">
                <p id="user-name" class="media-heading">${isCurrentUser ? 'You' : senderName}</p>
                <p id="message">${message}</p>
            </div>
        `;
        // Append message body to the list item
        messageLi.appendChild(mediaBodyDiv);
        // Append the message to the container
        messagesContainer.appendChild(messageLi);
    });

};

// Send a Message
const sendMessage = async () => {
    if (messageInput.value.trim() === "") return;
    const message = messageInput.value;
    const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'guest';
    const channelRef = db.ref(`channels/${currentChannelName}/messages`);
    channelRef.push({
        senderName: currentUserName,
        sender: userId,
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    messageInput.value = '';
};
loadMessages(currentChannelName);

// Button Click Event
sendMessageButton.addEventListener('click', sendMessage);
leaveChatButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

