import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { FIREBASE_DB, FIREBASE_AUTH } from '../FirebaseConfig'; // Make sure FIREBASE_AUTH is imported
import { collection, addDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AddCustomer = () => {
  const navigation = useNavigation();

  const [customerName, setCustomerName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setJoiningDate(selectedDate);
  };

  const handleAddCustomer = async () => {
    if (!customerName || !age || !gender || !mobile) {
      alert("Please fill all the fields.");
      return;
    }

    // Ensure the user is authenticated
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      alert("You must be logged in to add a customer.");
      navigation.navigate("Login"); // Navigate to the login screen if the user is not authenticated
      return;
    }

    setLoading(true); // Set loading to true before submitting

    try {
      const customerData = {
        customerName,
        age: parseInt(age), // Ensure age is stored as a number
        gender,
        mobile,
        joiningDate: joiningDate.toISOString(), // Convert date to a string
        address,
        email,
        profileImage, // Store image URI (uploading to Firebase Storage can be added later)
      };

      // Store customer data under the user's UID
      const userId = user.uid; // Get the user's UID
      const customerRef = collection(FIREBASE_DB, 'users', userId, 'customers');

      // Add data to Firestore
      const docRef = await addDoc(customerRef, customerData);
      alert(`Customer added successfully`);
      console.log("Customer added successfully");
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log("No screen to go back to.");
      }
    } catch (error) {
      console.error("Error adding customer: ", error);
      alert("An error occurred while adding the customer.");
    } finally {
      setLoading(false); // Set loading to false after the process is complete
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        <Text style={styles.backButtonText}>Add New Customer</Text>
      </TouchableOpacity>

      {/* Upload Picture */}
      <TouchableOpacity style={styles.imagePicker} >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <FontAwesome name="camera" size={50} color="#888" />
        )}
      </TouchableOpacity>

      <View style={styles.formContainer}>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          Joining Date: {joiningDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={joiningDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Add Customer Button */}
      <TouchableOpacity
        style={[styles.addButton, loading && styles.disabledButton]} // Add a style for disabled button
        onPress={handleAddCustomer}
        disabled={loading} // Disable the button when loading is true
      >
        <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Customer'}</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
    paddingTop: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 0,
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
    marginLeft: '22%',


  },
  imagePicker: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  picker: {
    height: 50,
    color: '#555',
  },
  datePicker: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 10,
    fontStyle: 'italic',
    fontSize: 16,
  },
  dateText: {
    color: '#555',
  },
  addButton: {
    backgroundColor: '#4B6CB7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0', // Change color to indicate disabled state
  },
});

export default AddCustomer;
