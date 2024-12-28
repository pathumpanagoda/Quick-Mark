import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome } from "@expo/vector-icons";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";

const MarkAttendance = ({ navigation }) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [amount, setAmount] = useState("");
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]); // State to store services from Firestore
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status

  const auth = getAuth(); // Get Firebase Authentication instance
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get current user's UID

  // Fetch customers from Firebase Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!userId) {
          Alert.alert("Error", "You must be logged in to view customers");
          return;
        }
        const querySnapshot = await getDocs(collection(FIREBASE_DB,"users", userId, "customers"));
        const customerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const fetchServices = async () => {
      try {
        // Fetch service categories from Firestore
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "users", userId, "serviceCategories"));
        const serviceList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(serviceList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchCustomers();
    fetchServices(); // Fetch services when the component mounts
  }, []);

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedService || !amount) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const attendanceData = {
      customer: selectedCustomer,
      service: selectedService,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    };

    setIsSubmitting(true); // Set loading state to true before submission

    try {
      // Save attendance data to Firestore
      if (!userId) {
        Alert.alert("Error", "You must be logged in to mark attendance.");
        navigation.navigate("Login"); // Navigate to the login screen if the user is not authenticated
        return;
      }
      const customerRef = collection(FIREBASE_DB, 'users', userId, "attendance");
      
      await addDoc(customerRef, attendanceData);
      Alert.alert("Success", "Attendance marked successfully!");

      // Navigate to Attendance History page (assuming it's set up in navigation)
      navigation.navigate("AttendanceHistory");

      // Reset form
      setSelectedCustomer("");
      setSelectedService("");
      setAmount("");
    } catch (error) {
      console.error("Error saving attendance:", error);
      Alert.alert("Error", "Failed to save attendance. Please try again.");
    } finally {
      setIsSubmitting(false); // Set loading state to false after submission (successful or failed)
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        <Text style={styles.backButtonText}>Mark Attendance</Text>
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Select Customer</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCustomer}
            onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
            style={styles.picker} // Use a separate style for the Picker itself
          >
            <Picker.Item label="Select Customer" value="" />
            {customers.map((customer) => (
              <Picker.Item
                key={customer.id}
                label={customer.customerName}
                value={customer.customerName}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Service Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedService}
            onValueChange={(itemValue) => setSelectedService(itemValue)}
            style={styles.picker} // Use a separate style for the Picker itself
          >
            <Picker.Item label="Select Service" value="" />
            {services.map((service) => (
              <Picker.Item key={service.id} label={service.name} value={service.name} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Enter Amount</Text>
        <TextInput
          style={styles.inputCommon} // Use the shared style
          placeholder="Enter Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} // Disable button during submission
          onPress={handleSubmit}
          disabled={isSubmitting} // Disable button while submitting
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit"} {/* Show different text while submitting */}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 24,
    color: "black",
    marginLeft: "20%",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
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
  inputCommon: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderColor: "#DDD",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 50, // Ensures a consistent height for both Picker and TextInput
    justifyContent: "center", // Center the text for Picker
  },
  pickerContainer: {
    borderWidth: 1, // Border for the Picker wrapper
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden", // Ensures the border-radius applies correctly
  },
  picker: {
    height: 50, // Maintain consistent height
    backgroundColor: "#FFF",
    justifyContent: "center", // Align the text in the center
  },
  submitButton: {
    backgroundColor: "#4B6CB7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#B0C4DE", // Lighter color when disabled
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MarkAttendance;
