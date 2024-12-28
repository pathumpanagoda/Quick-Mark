import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import Logo from "./assets/Q2.png"; // Your logo image

const SplashScreen = () => {
  const textPosition = useRef(new Animated.Value(-100)).current; // Initial position off-screen to the left

  useEffect(() => {
    // Animate the text moving from left to right
    Animated.timing(textPosition, {
      toValue: 0, // Move to the final position
      duration: 600, // Duration of the animation in milliseconds
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [textPosition]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logoImage} />
          <View style={styles.textMask}>
            <Animated.Text
              style={[
                styles.logoText,
                { transform: [{ translateX: textPosition }] },
              ]}
            >
              uickMark
            </Animated.Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#536bb3", // Background color for splash screen
  },
  logoWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  textMask: {
    overflow: "hidden", // Mask the text to create a clipping effect 
    justifyContent: "center",
    alignItems: "flex-start", // Align the text to start from the left
    marginLeft: -10, // Offset the text to match the logo
  },
});

export default SplashScreen;
