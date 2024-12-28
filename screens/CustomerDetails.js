import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig'; // Firebase config file
import { getAuth } from 'firebase/auth'; // Firebase Authentication

const CustomerDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        if (!userId) {
          Alert.alert('Error', 'You must be logged in to view customer details');
          return;
        }

        const customerRef = collection(FIREBASE_DB, 'users', userId, 'customers');
        const querySnapshot = await getDocs(customerRef);

        const customers = [];
        querySnapshot.forEach((doc) => {
          customers.push({ id: doc.id, ...doc.data() });
        });

        if (customers.length > 0) {
          setCustomer(customers[0]);
        } else {
          Alert.alert('Error', 'Customer not found');
        }
      } catch (error) {
        console.error('Error fetching customer details: ', error);
        Alert.alert('Error', 'Failed to fetch customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id, userId]);

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (customer) {
                await deleteDoc(doc(FIREBASE_DB, 'users', userId, 'customers', customer.id));
                console.log(`Customer with ID ${id} deleted.`);
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting customer: ', error);
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  if (loading) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Details</Text>
      </View>

      {/* Customer Profile */}
      <View style={styles.profileCard}>
        <View style={styles.imageContainer}>
          {customer.profileImage ? (
            <Image source={{ uri: customer.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultImage}>
              <FontAwesome name="user" size={50} color="#FFF" />
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{customer.customerName}</Text>
          <Text style={styles.details}>Age: {customer.age}</Text>
          <Text style={styles.details}>Gender: {customer.gender}</Text>
          <Text style={styles.details}>Mobile: {customer.mobile}</Text>
          <Text style={styles.details}>Email: {customer.email}</Text>
          <Text style={styles.details}>Address: {customer.address}</Text>
          <Text style={styles.details}>Joining Date: {new Date(customer.joiningDate).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditCustomerDetails', { id: customer.id })}
      >
        <Text style={styles.buttonText}>Edit Customer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Delete Customer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: '20%',
  },
  profileCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9EBCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginVertical: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#4B6CB7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
  errorText: {
    fontSize: 18,
    color: '#D9534F',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CustomerDetails;
