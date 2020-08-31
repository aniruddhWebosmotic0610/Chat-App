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

  //send group message by user
  sendGroupmsg = async (grp_id, grp_name, text, uid, uname, uphoto) => {
    const gref = await database().ref('/group_messages')
    gref.child(grp_id).push({
      user_id: uid,
      user_name: uname,
      u_photo: uphoto,
      group_id: grp_id,
      group_name: grp_name,
      group_message: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      const gDetail = database().ref('/group_details')
      gDetail.child(grp_id).child('recent_message').set({
        user_id: uid,
        user_name: uname,
        u_photo: uphoto,
        group_id: grp_id,
        group_name: grp_name,
        group_message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
    })

  }

  addGroupDetails = (grpName, members, user) => {
    return new Promise((resolve) => {
      const ref = database().ref('/group_details').push({
        name: grpName,
        admin_name: user.uname,
        admin_id: user.uid,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        members: members,
        recent_message: {
          group_name: grpName,
          group_message: "Welcome to " + grpName,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      }).then((res) => {
        console.log("members", members);
        for (const key in members) {
          const userRef = database().ref('/users_group').child(members[key].uid).push({
            group_id: res.key,
            group_name: grpName,
            created_at: firebase.database.ServerValue.TIMESTAMP
          })
        }
        resolve(true)
      })
    })
  }
  refOff = () => {
    // database().ref('/group_details').off();
    database().ref('/users_group').off();
    return;
  }
}




const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
