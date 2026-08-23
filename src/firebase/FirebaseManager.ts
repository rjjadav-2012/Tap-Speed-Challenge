// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Placeholder Firebase Configuration
// Replace this with your actual Firebase Project Config
// const firebaseConfig = {
//   apiKey: "AIzaSyYOUR_API_KEY_HERE",
//   authDomain: "tapspeedchallenge.firebaseapp.com",
//   projectId: "tapspeedchallenge",
//   storageBucket: "tapspeedchallenge.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abcdef1234567890"
// };

// Initialize Firebase (uncomment to activate)
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

export class FirebaseManager {
  constructor() {
    console.log("Firebase Manager Initialized with placeholder config.");
  }

  public async saveHighScore(username: string, score: number) {
    console.log(`[Firebase Mock] Saved score ${score} for user ${username}`);
    // try {
    //   await addDoc(collection(db, "leaderboard"), {
    //     username,
    //     score,
    //     timestamp: new Date()
    //   });
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }
  }

  public async getLeaderboard() {
    console.log(`[Firebase Mock] Fetching leaderboard...`);
    // const querySnapshot = await getDocs(collection(db, "leaderboard"));
    // querySnapshot.forEach((doc) => {
    //   console.log(`${doc.id} => ${doc.data()}`);
    // });
    return [];
  }
}
