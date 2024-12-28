import { StatusBar } from 'expo-status-bar';
import Navigation from './Navigation';
import React from 'react';
import  {useEffect, useState} from 'react';
import SplashScreen from './SplashScreen';



export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 2000);
  }, []);
  return (
    <>
    {isShowSplash ? <SplashScreen/> :
    <>
      <StatusBar
        barStyle="dark-content" // Use "dark-content" for white background
        style="default" // Use "default" for black background
      />
      <Navigation/>
    </>
    }
    </>
  );
}

