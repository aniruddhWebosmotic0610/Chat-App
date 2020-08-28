import firebase from '@react-native-firebase/app'
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { unionWith } from 'lodash'


const config = {
  apiKey: "AIzaSyChR_fE4fEdk62uwuGyLCQjIQygJ6YafQM",
  authDomain: "chat-app-492b6.firebaseapp.com",
  databaseURL: "https://chat-app-492b6.firebaseio.com",
  projectId: "chat-app-492b6",
  storageBucket: "chat-app-492b6.appspot.com",
  messagingSenderId: "1013171964319",
  appId: "1:1013171964319:web:6d3b3c84d7e26878b0d5aa",
  measurementId: "G-CJX7EB9QPL"
};

class FirebaseSvc {
  constructor() {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    } else {
      // console.log("firebase apps already running...")
    }
  }

  // configuraion firabase
  configuration = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    } else {
      // console.log("firebase apps already running...")
    }
  }
  // get userlist from firebase
  usersData = () => {
    let all = []
    return new Promise((resolve, reject) => {
      var docRef = firebase.firestore().collection("chatie_user")
      docRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          all.push(doc.data())
        }, resolve(all))
      })
    })
  }

  //to get live latest messages 
  getLatestMsgs = (uid) => {
    let result = [];
    return new Promise((resolve, reject) => {
      var docRef = firestore().collection("chat_messages").doc(uid).collection('latest_msg')
      docRef.orderBy('timestamp', 'desc').get().then(function (querySnapshot) {    // |
        querySnapshot.forEach(function (doc) {                                     // |this data is use to get data once of latest_msg collection
          result.push(doc.data())                                                  // |
        }, resolve(result))                                                        // |
      })                                                                           // |
    })
  }



  refOn = () => {
    return new Promise((resolve, reject) => {
      let cData = []
      this.ref.on('child_added', function (snapshot) {
        alert(JSON.stringify(snapshot))
        const { timestamp: numberStamp, text, user, name, femail, fid } = snapshot.val();
        const { key: id } = snapshot;
        const { key: _id } = snapshot;
        const timestamp = new Date(numberStamp);
        const message = {
          femail,
          fid,
          text,
          timestamp,
          user
        };
        cData.push(message)
        resolve(cData)
      })
    })
  }

  // for fetch messages from firestore
  fetchMessages = (fid, uid) => {
    let data = [];
    return new Promise((resolve, reject) => {
      var docRef = firebase.firestore().collection("chat_messages")
      docRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          // console.log(doc.id);
          data.push(doc.data())
        }, resolve(data))
      })
    })
  }

  // to store message input to firestore 
  send = async (fid, fname, fphoto, text, uid, uname, uphoto) => {
     const ref = await database().ref('/chat_messages')
    ref.child(fid).child(uid).push({
      user_id: uid,
      user_name: uname,
      from_id: fid,
      from_name: fname,
      text: text,
      created_at: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      ref.child(uid).child(fid).push({
        user_id: uid,
        user_name: uname,
        from_id: fid,
        from_name: fname,
        text: text,
        created_at: firebase.database.ServerValue.TIMESTAMP
      })
    }).then(() => {
      ref.child(uid).child(fid).child('recent_message').set({
        user_id: uid,
        user_name: uname,
        u_photo: uphoto,
        from_id: fid,
        from_name: fname,
        f_photo: fphoto,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
    }).then(() => {
      ref.child(fid).child(uid).child('recent_message').set({
        user_id: fid,
        user_name: fname,
        u_photo: fphoto,
        from_id: uid,
        from_name: uname,
        f_photo: uphoto,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
    })
  }

}

const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
