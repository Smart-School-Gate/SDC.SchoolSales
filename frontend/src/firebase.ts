import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD7Y_YjLhd6B7S3K-wSyRMQ0h95S7IqlTw',
  authDomain: 'rootaca-sales-97390.firebaseapp.com',
  projectId: 'rootaca-sales-97390',
  storageBucket: 'rootaca-sales-97390.firebasestorage.app',
  messagingSenderId: '956658163383',
  appId: '1:956658163383:web:707c7a5624bcfab4baf732',
  measurementId: 'G-5ZH227Z8P5',
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

void isSupported().then((supported) => {
  if (supported) {
    getAnalytics(firebaseApp);
  }
});
