import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig"; // Firebase config file
import Logo from "../../assets/Q.png";
import { getAuth, updateProfile } from 'firebase/auth';
import { CommonActions } from "@react-navigation/native";


const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    // Validate input fields
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Firebase signup
  createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    console.log("User created:", user);

    // Update the user's profile with their name
    await updateProfile(user, {
      displayName: name, // This updates the display name in Firebase Auth
    });

    // // Add user data to Firestore
    // await setDoc(doc(FIREBASE_DB, "users", user.uid), {
    //   name,
    //   email,
    //   createdAt: new Date().toISOString(),
    // });

     // Immediately sign the user out
     await FIREBASE_AUTH.signOut();

    Alert.alert("Success", "Account created successfully!");
    navigation.replace("LoginScreen"); // Navigate to the main screen
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    // Handle Firebase errors
    let alertMessage = errorMessage;
    if (errorCode === "auth/email-already-in-use") {
      alertMessage = "This email is already in use.";
    } else if (errorCode === "auth/invalid-email") {
      alertMessage = "Invalid email address.";
    } else if (errorCode === "auth/weak-password") {
      alertMessage = "Password should be at least 6 characters.";
    }

    Alert.alert("Error", alertMessage);
  });
  };

  const navigateToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }], // Reset stack to start with LoginScreen
      })
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={Logo}
            style={{
              width: 60,
              height: 60,
            }}
          />
          <Text style={styles.logoText}>uickMark </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Create an account</Text>
        <Text style={styles.subtitle}>
          Welcome! Please enter your details to create an account.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onSubmitEditing={handleSignup} // Trigger signup on Enter
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.signinText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 100,
    backgroundColor: "#536bb3",
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: -10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: -50,
    marginBottom: "40%",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#000",
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: "#536bb3",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  signupButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginText: {
    color: "#536bb3",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    bottom: 20, // Add spacing from the bottom of the screen
  },
  footerText: {
    color: "#777",
  },
  signinText: {
    color: "#536bb3",
    fontWeight: "bold",
  },
});

export default SignupScreen;
