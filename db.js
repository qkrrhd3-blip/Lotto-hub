// db.js (Firebase 모듈 연동 및 초기화)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

// 회원님이 주신 Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAqttVT7NctgevQiQk3nodHTEd2Rvsc9yc",
  authDomain: "lotto-auto-de3b6.firebaseapp.com",
  projectId: "lotto-auto-de3b6",
  storageBucket: "lotto-auto-de3b6.firebasestorage.app",
  messagingSenderId: "803888638617",
  appId: "1:803888638617:web:568a476ffc043885d2a608",
  measurementId: "G-08XGG3KWEL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 전역(window) 객체에 데이터베이스 접근 함수들 바인딩
window.firebaseDB = {
    db: db,
    storage: storage,
    collection: collection,
    addDoc: addDoc,
    getDocs: getDocs,
    getDoc: getDoc,
    doc: doc,
    deleteDoc: deleteDoc,
    query: query,
    orderBy: orderBy,
    limit: limit,
    ref: ref,
    uploadString: uploadString,
    getDownloadURL: getDownloadURL
};
