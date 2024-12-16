const firebaseConfig = {
  apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
  authDomain: "labtask2-cb64c.firebaseapp.com",
  databaseURL: "https://labtask2-cb64c-default-rtdb.firebaseio.com/",
  projectId: "labtask2-cb64c",
  storageBucket: "labtask2-cb64c.firebasestorage.app",
  messagingSenderId: "230466244503",
  appId: "1:230466244503:web:b99864da1301b2b601bed2",
};
const app = firebase.initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

console.log("Hello from script.js");

const auth = firebase.auth();
const db = firebase.firestore();
const analytic = firebase.analytics();
const messaging = firebase.messaging();
gtag("config", "G-12345ABCDE", { debug_mode: true });
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const logoutButton = document.getElementById("logout-button");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupEmailInput = document.getElementById("signup-email");
const signupPasswordInput = document.getElementById("signup-password");
const userInfo = document.getElementById("user-info");
const userEmail = document.getElementById("user-email");
const userName = document.getElementById("signup-name");
const addDataButton = document.getElementById("add-data-button");
const channelNameInput = document.getElementById("channel-name");
const channelDescriptionInput = document.getElementById("channel-description");
const dataList = document.getElementById("data-list").querySelector("ul");
const googleSignInButton = document.getElementById("google-signIn-button");
const phoneSignInButton = document.getElementById("phone-signIn-button");
const sendOtpButton = document.getElementById("send-otp-button");
const verifyOtpButton = document.getElementById("verify-otp-button");
const phoneNumberInput = document.getElementById("phone-number");
const otpCodeInput = document.getElementById("otp-code");
const signUpToggle = document.getElementById("signup-toggle");
const loginToggle = document.getElementById("login-toggle");
const getUserRole = async (userId) => {
  const userDoc = await db.collection("users").doc(userId).get();
  return userDoc.exists ? userDoc.data().role : null;
};
const setupUIForRole = async (userId) => {
  const role = await getUserRole(userId);
  if (role === "admin") {
    document.getElementById("firestore-container").style.display = "block"; // Admin UI
  } else if (role === "user") {
    document.getElementById("firestore-container").style.display = "none"; // Hide admin options
  }
};
addDataButton.addEventListener("click", () => {
  const channelName = channelNameInput.value;
  const channelDescription = channelDescriptionInput.value;
  addChannel(channelName, channelDescription);
});
function updateUI(user) {
  if (user) {
    userInfo.style.display = "block";
    userEmail.textContent = user.email || user.phoneNumber;
    // Hide login/signup forms
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("channel-list").style.display = "block";
    document.getElementById("signUp-EmailandPass").style.display = "none";
    document.getElementById("phone-auth-section").style.display = "none";
    setupUIForRole(user.uid);
  } else {
    userInfo.style.display = "none";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signUp-EmailandPass").style.display = "block";
    document.getElementById("channel-list").style.display = "none";
  }
}

// User Subscription
const subscribeToChannelEvent = async (channelId, userId) => {
  try {
    await analytic.logEvent("subscribe_to_channel", {
      channelId: channelId,
      userId: userId,
    });
    console.log("User subscribed to channel event logged.");
  } catch (error) {
    console.error("Error logging user subscribed to channel event:", error);
  }
};
const unsubscribeFromChannelEvent = async (channelId, userId) => {
  try {
    await analytic.logEvent("unsubscribe_from_channel", {
      channelId: channelId,
      userId: userId,
    });
    console.log("User unsubscribed from channel event logged.");
  } catch (error) {
    console.error("Error logging user unsubscribed from channel event:", error);
  }
};
// First-Time Login
const firstTimeLoginEvent = async () => {
  try {
    await analytic.logEvent("first_time_login");
    console.log("First-time login event logged.");
  } catch (error) {
    console.error("Error logging first-time login event:", error);
  }
};

Notification.requestPermission().then(function (permission) {
  if (permission === "granted") {
    console.log("Notification permission granted.");
    getFcmToken(); // Call the function to get the FCM token after permission is granted
  } else {
    console.error("Notification permission denied.");
  }
});
// Function to get the FCM token
function getFcmToken() {
  messaging
    .getToken({
      vapidKey:
        "BA6HApjmjpnteMuPv_-ox9HY2I9vfxMjmWu3Qj2rW1oj6k8DR2C_--p2X7kvJFjJYiwnI9QCSAnMAMyKfpdynLg",
    }) // VAPID key is required for Web Push
    .then(function (currentToken) {
      if (currentToken) {
        console.log("FCM Token: ", currentToken);
        // You can now send the token to your server for push notification targeting
      } else {
        console.log(
          "No FCM token available. Request permission to generate one."
        );
      }
    })
    .catch(function (error) {
      console.error("Error getting FCM token: ", error);
    });
}

auth.onAuthStateChanged((user) => {
  localStorage.setItem("userId", user.uid);
  user.metadata.creationTime === user.metadata.lastSignInTime &&
    firstTimeLoginEvent();
  updateUI(user);
});
const addChannel = async (channelName, description) => {
  try {
    await db.collection("channels").add({
      name: channelName,
      description: description,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      members: [], // Initially empty
    });
    console.log("Channel added successfully!");

    channelNameInput.value = "";
    channelDescriptionInput.value = "";
    loadChannels();
  } catch (error) {
    console.error("Error adding channel:", error);
  }
};
const removeChannel = async (channelId) => {
  try {
    await db.collection("channels").doc(channelId).delete();
    console.log("Channel removed successfully!");
    loadChannels();
  } catch (error) {
    console.error("Error removing channel:", error);
  }
};
async function loadChannels() {
  const channelList = document.querySelector("#data-list ul");
  channelList.innerHTML = ""; // Clear list
  const userId = auth.currentUser?.uid; // Get current user ID
  if (!userId) throw new Error("User not logged in.");
  const userDoc = userId
    ? await db.collection("users").doc(userId).get()
    : null;
  const subscribedChannels = userDoc?.data()?.channels || [];

  const querySnapshot = await db.collection("channels").get();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const listItem = document.createElement("li");
    listItem.className =
      "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = `${data.name}`;

    const buttonContainer = document.createElement("div");
    userRole = userDoc?.data()?.role;
    // Admin: Add remove button
    if (userRole === "admin") {
      const removeButton = document.createElement("button");
      removeButton.className = "btn btn-danger btn-sm";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => removeChannel(doc.id));
      buttonContainer.appendChild(removeButton);
    }
    //chat button
    const chatButton = document.createElement("button");
    chatButton.className = "btn btn-primary btn-sm";
    chatButton.textContent = "Join Chat";
    chatButton.disabled = !subscribedChannels.includes(doc.id);

    // Subscribe button
    const subscribeButton = document.createElement("button");
    subscribeButton.className = "btn btn-success btn-sm mr-2";
    subscribeButton.textContent = "Subscribe";
    subscribeButton.disabled = subscribedChannels.includes(doc.id);
    subscribeButton.addEventListener("click", () =>
      subscribeToChannel(doc.id, subscribeButton, unsubscribeButton, chatButton)
    );

    // Unsubscribe button
    const unsubscribeButton = document.createElement("button");
    unsubscribeButton.className = "btn btn-warning btn-sm";
    unsubscribeButton.textContent = "Unsubscribe";
    unsubscribeButton.disabled = !subscribedChannels.includes(doc.id);
    unsubscribeButton.addEventListener("click", () =>
      unsubscribeFromChannel(
        doc.id,
        subscribeButton,
        unsubscribeButton,
        chatButton
      )
    );
    chatButton.addEventListener("click", () => JoinChat(data.name));
    buttonContainer.appendChild(chatButton);
    buttonContainer.appendChild(subscribeButton);
    buttonContainer.appendChild(unsubscribeButton);

    listItem.appendChild(buttonContainer);
    channelList.appendChild(listItem);
  });
}
const subscribeToChannel = async (
  channelId,
  subscribeButton,
  unsubscribeButton,
  chatButton
) => {
  try {
    const userId = auth.currentUser?.uid; // Get current user ID
    if (!userId) throw new Error("User not logged in.");

    // Update Firestore with subscribed channel
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          channels: firebase.firestore.FieldValue.arrayUnion(channelId),
        },
        { merge: true }
      );
    //add user to members of channel
    await db
      .collection("channels")
      .doc(channelId)
      .set(
        {
          members: firebase.firestore.FieldValue.arrayUnion(userId),
        },
        { merge: true }
      );
    subscribeToChannelEvent(channelId, userId);
    console.log("Subscribed to channel!");
    subscribeButton.disabled = true;
    unsubscribeButton.disabled = false;
    chatButton.disabled = false;
  } catch (error) {
    console.error("Error subscribing to channel:", error);
  }
};
const unsubscribeFromChannel = async (
  channelId,
  subscribeButton,
  unsubscribeButton,
  chatButton
) => {
  try {
    const userId = auth.currentUser?.uid; // Get current user ID
    if (!userId) throw new Error("User not logged in.");

    // Update Firestore to remove channel from subscriptions
    await db
      .collection("users")
      .doc(userId)
      .update({
        channels: firebase.firestore.FieldValue.arrayRemove(channelId),
      });
    //remove user from members of channel
    await db
      .collection("channels")
      .doc(channelId)
      .set(
        {
          members: firebase.firestore.FieldValue.arrayRemove(userId),
        },
        { merge: true }
      );
    unsubscribeFromChannelEvent(channelId, userId);
    console.log("Unsubscribed from channel!");
    subscribeButton.disabled = false;
    unsubscribeButton.disabled = true;
    chatButton.disabled = true;
  } catch (error) {
    console.error("Error unsubscribing from channel:", error);
  }
};
const JoinChat = async (channelName) => {
  const userId = auth.currentUser?.uid; // Get current user ID
  if (!userId) throw new Error("User not logged in.");
  localStorage.setItem("channelName", channelName);
  window.location.href = "chat.html";
};
signUpToggle.addEventListener("click", () => {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  document.getElementById("login-toggle").style.display = "block";
  document.getElementById("signup-toggle").style.display = "none";
});
loginToggle.addEventListener("click", () => {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-toggle").style.display = "none";
  document.getElementById("signup-toggle").style.display = "block";
});

signupButton.addEventListener("click", async () => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(
      emailInput.value,
      passwordInput.value
    );
    const user = userCredential.user;
    assignUserRole(user.uid, "user", userName.value);
    updateUI(user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
});
loginButton.addEventListener("click", async () => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      emailInput.value,
      passwordInput.value
    );
    const user = userCredential.user;
    localStorage.setItem("userId", user.uid);
    userDoc = await db.collection("users").doc(user.uid).get();
    const userName = userDoc.data().Name;
    localStorage.setItem("userName", userName);
    updateUI(user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
});
logoutButton.addEventListener("click", async () => {
  try {
    await auth.signOut();
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("channelName");
    updateUI(null);
  } catch (error) {
    console.error("Error logging out:", error);
  }
});
// Assign user role in Firestore
async function assignUserRole(userId, role, displayName) {
  try {
    await db.collection("users").doc(userId).set(
      {
        Name: displayName,
        role: role,
        channels: [],
      },
      { merge: true }
    );
    console.log("User role assigned.");
  } catch (error) {
    console.error("Error assigning user role:", error);
  }
}
// Load channels on page load
document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadChannels();
    } else {
      dataList.innerHTML = "<p>Please log in to see channels.</p>";
    }
    updateUI(user);
  });
});
let recaptchaVerifier;
function setupRecaptcha() {
  recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: function (response) {
        console.log("Recaptcha verified.");
      },
    }
  );
}
googleSignInButton.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const userName = user.displayName;
    localStorage.setItem("userName", user.displayName);
    // check if user already exists
    userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      assignUserRole(user.uid, "user", userName);
    }
    updateUI(user);
  } catch (error) {
    console.error("Error with Google Sign-Up:", error);
  }
});
// Phone Sign-Up
phoneSignInButton.addEventListener("click", () => {
  document.getElementById("phone-auth-section").style.display = "block";
  setupRecaptcha();
});
sendOtpButton.addEventListener("click", async () => {
  const phoneNumber = phoneNumberInput.value;
  try {
    if (!recaptchaVerifier) setupRecaptcha(); // Ensure Recaptcha is set up
    const confirmationResult = await auth.signInWithPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    window.confirmationResult = confirmationResult;
    console.log("OTP sent successfully.");
    alert("OTP has been sent to your phone.");
    document.getElementById("otp-section").style.display = "block";
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (error.code === "auth/missing-phone-number") {
      alert("Please enter a valid phone number.");
    } else {
      alert("Failed to send OTP. Please try again.");
    }
  }
});
verifyOtpButton.addEventListener("click", async () => {
  const code = otpCodeInput.value;
  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;
    // check if user already exists
    userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      assignUserRole(user.uid, "user", phoneNumberInput.value);
    }
    localStorage.setItem("userName", phoneNumberInput.value);
    updateUI(user);
  } catch (error) {
    console.error("Error verifying OTP:", error);
  }
});
