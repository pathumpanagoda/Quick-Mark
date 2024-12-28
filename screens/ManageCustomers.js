import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig'; // Firebase config file
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication

const ManageCustomers = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const auth = getAuth(); // Get Firebase Authentication instance
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get current user's UID

  useEffect(() => {
    if (userId) {
      const fetchCustomers = async () => {
        try {
          const customerRef = collection(FIREBASE_DB, 'users', userId, 'customers');
          const querySnapshot = await getDocs(customerRef);
          const customersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCustomers(customersList);
          setFilteredCustomers(customersList);
        } catch (error) {
          console.error("Error fetching customers: ", error);
        }
      };

      fetchCustomers();
    }
  }, [userId]);

  useEffect(() => {
    // Filter customers based on search text
    const filtered = customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchText, customers]);

  const handleSort = () => {
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.customerName.localeCompare(b.customerName);
      } else {
        return b.customerName.localeCompare(a.customerName);
      }
    });
    setFilteredCustomers(sortedCustomers);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <View style={styles.container}>
      {/* White Container */}
      <View style={styles.whiteContainer}>
        {/* Header with Back Button and Title */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
          </TouchableOpacity>

          <Text style={styles.title}>Customers</Text>

          <Text style={styles.totalCustomers}>
            ({filteredCustomers.length})
          </Text>
        </View>

        {/* Search Bar and Sort Icon */}
        <View style={styles.searchSortContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleSort}>
            <FontAwesome
              name={sortOrder === 'asc' ? 'sort-alpha-asc' : 'sort-alpha-desc'}
              size={24}
              color="#4B6CB7"
              style={styles.sortIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.customerCard}
            onPress={() => navigation.navigate('CustomerDetails', { id: item.id })}
          >
            <View style={styles.customerInfo}>
              <View style={styles.imageContainer}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.defaultImage}>
                                <FontAwesome name="user" size={50} color="#fff" />
                              </View>
                )}
              </View>
              <View style={styles.textInfo}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <Text style={styles.customerDetails}>{item.age} years old</Text>
                <Text style={styles.customerDetails}>{item.mobile}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#F8F8F8',
  },
  whiteContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalCustomers: {
    fontSize: 16,
    color: '#888',
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    flex: 1,
  },
  sortIcon: {
    marginLeft: 10,
    marginTop: -20,
  },
  customerCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#9EBCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerDetails: {
    fontSize: 14,
    color: '#888',
  },
});

export default ManageCustomers;
