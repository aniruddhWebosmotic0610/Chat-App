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
      console.log("firebase apps already running...")
    }
  }

  authData = (email) => {
    database()
      .ref('users')
      .orderByChild('emailAddress')
      .equalTo(email)
      .once('value', snap => console.log('this is authantcation data==> ' + snap.val()))
  }

  login = async (user, success_callback, failed_callback) => {
    const output = await firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(success_callback, failed_callback)
  }

  loginData = () => {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          //console.log("user: ", user);
          resolve(user)
          // User is signed in.
        } else {
          // No user is signed in.
        }
      })
    })
  }

  observeAuth = () => {
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }
  onAuthStateChanged = user => {
    if (!user) {
      try {
        this.login(user);
      } catch ({ message }) {
        console.log("Failed:" + message)
      }
    } else {
      console.log("Reusing auth...");
    }
  }

  createAccount = async (user) => {
    return new Promise((resolve, reject) => {
      firebase.auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(function (pass) {
          var userf = firebase.auth().currentUser;
          userf.updateProfile({ displayName: user.name })
            .then(function () {
              firebase.firestore().collection("chatie_user").doc(pass.user.uid).set({
                uid: pass.user.uid,
                email: pass.user.email,
                name: user.name,
                emailVerified: pass.user.emailVerified
              })
                .then(function () {
                  console.log("Document successfully written!");
                })
                .catch(function (error) {
                  console.error("Error writing document: ", error);
                });
              alert("User " + user.name + " was created successfully. Please login.")
            }, function (error) {
              console.warn("Error update displayName.");
            });
        }, function (error) {
          console.error("got error:" + typeof (error) + " string:" + error.message);
          alert("Create account failed. Error: " + error.message);
        })
    })
  }

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

  onLogout = user => {
    firebase.auth().signOut().then(function () {
      console.log("Sign-out successful.");
    }).catch(function (error) {
      console.log("An error happened when signing out");
    });
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get ref() {
    return firebase.database().ref('chat_messages');
  }

  refOn = () => {
    return new Promise((resolve, reject) => {
      let cData = []
      this.ref.on('child_added', function (snapshot) {
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

  fetchMessages = async () => {
    let data = [];
    return new Promise((resolve, reject) => {
      var docRef = firebase.firestore().collection("chat_messages")
      console.log('docRef', docRef);
      docRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          data.push(doc.data())
        }, resolve(data))

      })
    })
  }


  send = async (fid, femail, fname, text, uid, uemail, uname) => {
    await firestore().collection('chat_messages').add({
      text,
      user_id: uid,
      from_id: fid,
      created_at: new Date()
    })
    // await firestore().collection('chat_messages').doc(uid).collection(fid).add({
    //   text,
    //   user_id: uid,
    //   created_at: new Date()
    // })
    // firebase.database().ref('chat_messages/').push({
    //   'fid': fid,
    //   'femail': femail,
    //   'fname': fname,
    //   'text': text,
    //   "timestamp": firebase.database().ServerValue.TIMESTAMP,
    //   user: {
    //     'uid': uid,
    //     'uemail': uemail,
    //     'uname': uname
    //   }

    // }).then((data) => {
    //   console.log('data ', data)
    // }).catch((error) => {
    //   console.log('error ', error)
    // })
  }

  // refOff() {
  //   this.ref.off();
  // }
}

const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
