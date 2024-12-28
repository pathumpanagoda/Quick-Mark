import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Navigation from "./Navigation";
import SplashScreen from "./SplashScreen";
import { FIREBASE_AUTH } from "./FirebaseConfig";

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Track login state

  useEffect(() => {
    // Simulate SplashScreen display duration
    const splashTimeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1000);

    return () => clearTimeout(splashTimeout);
  }, []);

  useEffect(() => {
    // Use Firebase Auth to listen to user state changes
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Update login state based on user presence
    });

    return () => unsubscribe(); // Clean up listener on component unmount
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  if (isLoggedIn === null) {
    // Show SplashScreen or loading state while checking auth status
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content" // Use "dark-content" for white background
        style="default" // Use "default" for black background
      />
      <Navigation isLoggedIn={isLoggedIn} />
    </>
  );
}
