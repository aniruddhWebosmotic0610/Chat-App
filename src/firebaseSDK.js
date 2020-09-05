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
      docRef.orderBy('name', 'asc').get().then(function (querySnapshot) {
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


  // for fetch messages from firestore
  fetchMessages = (fid, uid) => {
    let data = [];
    return new Promise((resolve, reject) => {
      var docRef = firebase.firestore().collection("chat_messages")
      docRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          data.push(doc.data())
        }, resolve(data))
      })
    })
  }
  send = async (fid, fname, fphoto, text, imgUrl, uid, uname, uphoto) => {
    const ref = await firestore().collection('chatie_user')
    ref.doc(uid).collection('messages').add({
      user_id: uid,
      user_name: uname,
      from_id: fid,
      from_name: fname,
      image: imgUrl ? imgUrl : null,
      text: text,
      created_at: new Date().getTime()
    }).then(() => {
      ref.doc(fid).collection('messages').add({
        user_id: uid,
        user_name: uname,
        from_id: fid,
        from_name: fname,
        image: imgUrl ? imgUrl : null,
        text: text,
        created_at: new Date().getTime()
      })
    }).then(() => {
      ref.doc(uid).collection('recent_message').doc(fid).set({
        user_id: uid,
        user_name: uname,
        u_photo: uphoto,
        from_id: fid,
        from_name: fname,
        f_photo: fphoto,
        image: imgUrl ? imgUrl : null,
        text: text,
        timestamp: new Date().getTime()
      })
    }).then(() => {
      ref.doc(fid).collection('recent_message').doc(uid).set({
        user_id: fid,
        user_name: fname,
        u_photo: fphoto,
        from_id: uid,
        from_name: uname,
        f_photo: uphoto,
        image: imgUrl ? imgUrl : null,
        text: text,
        timestamp: new Date().getTime()
      })
    })
  }

  //send group message by user
  sendGroupmsg = async (grp_id, grp_name, text, imgUrl, uid, uname, uphoto) => {
    const ref = await firestore().collection('group_details').doc(grp_id)
    ref.collection('group_message').add({
      user_id: uid,
      user_name: uname,
      u_photo: uphoto,
      group_id: grp_id,
      group_name: grp_name,
      group_image: imgUrl ? imgUrl : null,
      group_message: text,
      timestamp: new Date().getTime()
    }).then(() => {
      let members = []
      ref.get().then(async function (doc) {
        members = doc.data().members
        for (const key in members) {
          const userRef = await firestore().collection('chatie_user').doc(members[key].uid)
          userRef.collection('recent_message').doc(grp_id).set({
            user_id: uid,
            user_name: uname,
            u_photo: uphoto,
            group_id: grp_id,
            group_name: grp_name,
            group_image: imgUrl ? imgUrl : null,
            group_message: text,
            timestamp: new Date().getTime()
          })
        }
      })
    })
  }

  // add group details in firestore
  addGroupDetails = (grpName, members, user) => {
    return new Promise(async (resolve) => {
      const ref = await firestore().collection('group_details')
      ref.add({
        name: grpName,
        admin_name: user.uname,
        admin_id: user.uid,
        created_at: new Date().getTime(),
        members: members,
        recent_message: {
          group_name: grpName,
          group_message: "Welcome to " + grpName,
          timestamp: new Date().getTime()
        }
      }).then(async (res) => {
        for (const key in members) {
          const userRef = await firestore().collection('chatie_user').doc(members[key].uid)
          userRef.collection('groups').add({
            group_id: res.id,
            group_name: grpName,
            created_at: new Date().getTime()
          })
          userRef.collection('recent_message').doc(res.id).set({
            user_id: user.uid,
            user_name: user.uname,
            group_id: res.id,
            group_name: grpName,
            group_message: "Welcome to " + grpName,
            timestamp: new Date().getTime()
          })
          resolve(true)
        }
      })
    })
  }
}




const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
