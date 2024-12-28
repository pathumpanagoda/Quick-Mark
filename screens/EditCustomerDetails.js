import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import * as Yup from "yup";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication
import { FIREBASE_DB } from "../FirebaseConfig"; // Firebase config file

const EditCustomerDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; // Get the customer ID passed from CustomerDetails

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isUpdating, setIsUpdating] = useState(false); // State for disabling button

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        // Get the current user's UID
        const auth = getAuth(); // Initialize Firebase Authentication
        const userId = auth.currentUser?.uid;

        if (!userId) {
          Alert.alert("Error", "You need to be logged in.");
          return;
        }

        // Fetch the customer document for the authenticated user
        const customerDocRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "customers",
          id
        );
        const customerDoc = await getDoc(customerDocRef);

        if (customerDoc.exists()) {
          setCustomer({ id: customerDoc.id, ...customerDoc.data() });
        } else {
          Alert.alert("Error", "Customer not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching customer details: ", error);
        Alert.alert("Error", "Failed to fetch customer details");
      } finally {
        setLoading(false); // Set loading to false after the update operation
      }
    };

    fetchCustomerDetails();
  }, [id]);

  const handleUpdate = async (values) => {
    setIsUpdating(true); // Disable the button
    try {
      const auth = getAuth(); // Initialize Firebase Authentication
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert("Error", "You need to be logged in.");
        return;
      }

      // Update the customer document for the authenticated user
      const customerRef = doc(FIREBASE_DB, "users", userId, "customers", id);
      await updateDoc(customerRef, values);

      Alert.alert("Success", "Customer details updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating customer details: ", error);
      Alert.alert("Error", "Failed to update customer details");
    } finally {
      setIsUpdating(false); // Disable the button
    }
  };
  if (loading) {
    // Show loading spinner while data is being fetched
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B6CB7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!customer) {
    return <Text style={styles.errorText}>Customer not found</Text>;
  }

  const validationSchema = Yup.object({
    customerName: Yup.string().required("Name is required"),
    age: Yup.string().required("Age is required"),
    gender: Yup.string().required("Gender is required"),
    mobile: Yup.string().required("Mobile number is required"),
    email: Yup.string().email("Invalid email address"),
    address: Yup.string(),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Customer</Text>
      </View>

      <Formik
        initialValues={customer}
        validationSchema={validationSchema}
        onSubmit={(values) => handleUpdate(values)}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange("customerName")}
              onBlur={handleBlur("customerName")}
              value={values.customerName}
              placeholder="Enter customer name"
            />
            {touched.customerName && errors.customerName && (
              <Text style={styles.error}>{errors.customerName}</Text>
            )}

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={handleChange("age")}
              onBlur={handleBlur("age")}
              value={String(values.age)} // Ensure it is a string
              placeholder="Enter customer age"
            />

            {touched.age && errors.age && (
              <Text style={styles.error}>{errors.age}</Text>
            )}

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values.gender}
                onValueChange={handleChange("gender")}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            {touched.gender && errors.gender && (
              <Text style={styles.error}>{errors.gender}</Text>
            )}

            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={handleChange("mobile")}
              onBlur={handleBlur("mobile")}
              value={values.mobile}
              placeholder="Enter mobile number"
            />
            {touched.mobile && errors.mobile && (
              <Text style={styles.error}>{errors.mobile}</Text>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              placeholder="Enter email address"
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange("address")}
              onBlur={handleBlur("address")}
              value={values.address}
              placeholder="Enter address"
            />
            {touched.address && errors.address && (
              <Text style={styles.error}>{errors.address}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isUpdating && styles.submitButtonDisabled, // Style for disabled button
              ]}
              onPress={handleSubmit}
              disabled={isUpdating} // Disable button during update
            >
              <Text style={styles.submitButtonText}>Update Customer</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: "21%",
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
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#4B6CB7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#B0C4DE", // Disabled button color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "#D9534F",
    textAlign: "center",
    marginTop: 20,
  },
});

export default EditCustomerDetails;
