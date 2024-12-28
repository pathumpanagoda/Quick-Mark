import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../FirebaseConfig"; // Your Firebase config file
import { getAuth } from "firebase/auth";

const UpdateAttendance = ({ route, navigation }) => {
  const { recordId } = route.params;

  const [attendanceRecord, setAttendanceRecord] = useState({
    customer: "",
    service: "",
    amount: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (!userId) {
          Alert.alert("Error", "You need to be logged in.");
          return;
        }

        const recordRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "attendance",
          recordId
        );
        const recordSnap = await getDoc(recordRef);

        if (recordSnap.exists()) {
          setAttendanceRecord(recordSnap.data());
        } else {
          Alert.alert("Error", "Record not found.");
        }
      } catch (error) {
        console.error("Error fetching record:", error);
        Alert.alert("Error", "Failed to load record.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const handleInputChange = (field, value) => {
    setAttendanceRecord((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const { customer, service, amount } = attendanceRecord;
    if (!amount.trim()) {
      Alert.alert("Validation Error", "Amount is required.");
      return false;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Validation Error", "Amount must be a positive number.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert("Error", "You need to be logged in.");
        return;
      }

      const recordRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "attendance",
        recordId
      );
      await updateDoc(recordRef, attendanceRecord);

      Alert.alert("Success", "Record updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating record:", error);
      Alert.alert("Error", "Failed to update record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Attendance Record</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.infoText}>
          You are not allowed to change Customer Name and Service !
        </Text>

        {/* Customer Name Input */}
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter customer name"
          value={attendanceRecord.customer}
          onChangeText={(text) => handleInputChange("customer", text)}
          editable={false} // Disabling input
        />

        {/* Service Input */}
        <Text style={styles.label}>Service</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter service"
          value={attendanceRecord.service}
          onChangeText={(text) => handleInputChange("service", text)}
          editable={false} // Disabling input
        />

        {/* Amount Input */}
        <Text style={styles.label}>
          Amount <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={String(attendanceRecord.amount)}
          onChangeText={(text) => handleInputChange("amount", text)}
          keyboardType="numeric"
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          accessibilityLabel="Save Changes"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: "10%",
  },
  formContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 14,
    color: "green",
    marginBottom: 10,
  },
  required: {
    color: "red",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4B6CB7",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#B0C4DE",
  },
});

export default UpdateAttendance;
