import React, { useState, useRef } from "react";
import "./index.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  //your confg goes here
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {user ? <><SignOut /><ChatRoom /> </>: <Signin />}
    </div>
  );
}

function Signin() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => console.log('Error OCcured', err));
  };

  return <button onClick={signInWithGoogle}> Sign In with Google </button>;
}

function SignOut() {
  return (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt");

  const [messages ] = useCollectionData(query, { idField: "id"}); // async call , so it goes into event loop
  console.log(messages)
  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      chat: document.getElementById('chatMessage').value,
      uid,
      photoURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    document.getElementById('chatMessage').value = '';
  }
  return (
    <>
    <main>
      { messages && messages.map(message => <ChatMessage message ={message} />)}

    </main>
    <form onSubmit={sendMessage}>
      <input required id='chatMessage' type="text"></input>
      <button type="submit">Send</button>
    </form>
    </>

  )
}

function ChatMessage(props) {
  const { chat, uid, photoURL } = props.message;
  console.log(props.message);

  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";

  return (
    <div className={`message ${messageClass}`}>
      <img alt="NA" src={photoURL} />
      <p>{chat}</p>;
    </div>
  );
}
