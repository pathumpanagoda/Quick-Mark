import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Logo from "../../assets/Q.png";
import { CommonActions } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); // State to track loading status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        navigation.replace("TabGroup");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    setLoading(true); // Set loading to true while updating
    if (!email || !password) {
      Alert.alert("Error", "Please provide both email and password");
      setLoading(false); // Set loading to false after the update operation
      return;
    }

    signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
      .then((userCredential) => {
        console.log("User signed in:", userCredential.user);
      })
      .catch((error) => {
        Alert.alert("Error", "Invalid email or password. Please try again.");
      })
      .finally(() => {
        setLoading(false); // Set loading to false after the update operation
      }
      );
  };

  const navigateToSignup = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "SignupScreen" }], // Reset stack to start with SignupScreen
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Enter your email and password to login.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Your email/username"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Your password"
          secureTextEntry
          onChangeText={setPassword}
          onSubmitEditing={handleLogin} // Trigger signup on Enter
        />
        <TouchableOpacity>
          <Text
            style={{ color: "#536bb3", textAlign: "right", marginBottom: 15 }}
          >
            Forgot password?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} // Disable button when loading
          onPress={handleLogin}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={navigateToSignup}>
          <Text style={styles.signupText}>Signup Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    marginBottom: "65%",
  },
  title: {
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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#536bb3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    bottom: 0, // Add spacing from the bottom of the screen
  },
  footerText: {
    color: "#777",
  },
  signupText: {
    color: "#536bb3",
    fontWeight: "bold",
  },
});

export default LoginScreen;
