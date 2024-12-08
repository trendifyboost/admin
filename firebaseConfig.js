// firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCO2KsBx8UVttuQVpePMkDdebLxC1uSI1A",
  authDomain: "nasimul-islam-dggumx.firebaseapp.com",
  databaseURL: "https://nasimul-islam-dggumx-default-rtdb.firebaseio.com",
  projectId: "nasimul-islam-dggumx",
  storageBucket: "nasimul-islam-dggumx.appspot.com",
  messagingSenderId: "482637964405",
  appId: "1:482637964405:web:d6282975958cc1e641c43c"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
