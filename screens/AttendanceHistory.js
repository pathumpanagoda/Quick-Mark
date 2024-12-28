import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "../FirebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

const AttendanceHistory = ({ navigation }) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const auth = getAuth(); // Get Firebase Authentication instance
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get current user's UID
  const [isRefreshing, setIsRefreshing] = useState(false); // State for manual refresh

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchAttendanceRecords = async () => {
    try {
      if (!userId) {
        Alert.alert(
          "Error",
          "You must be logged in to view attendance records"
        );
        return;
      }
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, "users", userId, "attendance")
      );
      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      Alert.alert("Error", "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    const filtered = attendanceRecords.filter((item) => {
      const recordDate = new Date(item.date);
      return (
        recordDate >= startDate &&
        recordDate <= endDate &&
        item.customer.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredRecords(filtered);
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    filterRecords();
  };

  const handleDateChange = (type, selectedDate) => {
    if (type === "start") {
      setStartDate(selectedDate || startDate);
      fetchStats(selectedDate || startDate, endDate);
    } else if (type === "end") {
      setEndDate(selectedDate || endDate);
      fetchStats(startDate, selectedDate || endDate);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        {
          text: "No",
          onPress: () => console.log("Deletion canceled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (!userId) {
                Alert.alert(
                  "Error",
                  "You must be logged in to delete records."
                );
                return;
              }
              await deleteDoc(
                doc(FIREBASE_DB, "users", userId, "attendance", id)
              );
              Alert.alert("Success", "Record deleted successfully.");
              fetchAttendanceRecords(); // Refresh the list after deletion
            } catch (error) {
              console.error("Error deleting record:", error);
              Alert.alert("Error", "Failed to delete record.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true); // Show loading indicator
    await fetchAttendanceRecords(); // Fetch fresh data
    setIsRefreshing(false); // Hide loading indicator
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, searchText, startDate, endDate]);

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Text style={styles.dateText2}>
        {new Date(item.date).toLocaleDateString()} (
        {new Date(item.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        )
      </Text>

      <View style={styles.cardDetails}>
        <View style={styles.row}>
          <Text style={styles.label}>Service:</Text>
          <Text style={styles.value}>{item.service}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text
            style={[
              styles.value,
              { color: item.status === "Won" ? "green" : "red" },
            ]}
          >
            Rs. {item.amount}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            { color: item.status === "Won" ? "green" : "red" },
          ]}
        >
          {item.status}
        </Text>
      </View>

      {/* Three Dot Icon for Edit/Delete */}
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Options",
            "Choose an action",
            [
              {
                text: "Edit",
                onPress: () => {
                  // Navigate to UpdateAttendance page with the item ID
                  navigation.navigate("UpdateAttendance", {
                    recordId: item.id,
                  });
                },
              },
              {
                text: "Delete",
                onPress: () => handleDelete(item.id),
              },
            ],
            { cancelable: true }
          )
        }
        style={styles.threeDotIcon}
      >
        <FontAwesome name="ellipsis-v" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.whiteContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
          </TouchableOpacity>

          <Text style={styles.title}>Attendance History</Text>
        </View>

        <View style={styles.searchSortContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name"
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>

        <View style={styles.datePickerContainer}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateText}>
              Start Date: {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                handleDateChange("start", selectedDate);
              }}
            />
          )}

          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateText}>
              End Date: {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                handleDateChange("end", selectedDate);
              }}
            />
          )}
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  whiteContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 20,
    paddingTop: 50,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: "21%",
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    paddingBottom: 0,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText2: {
    fontSize: 14,
    color: "#5DA646",
    marginBottom: 10,
  },
  cardDetails: {
    flexDirection: "column",
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  threeDotIcon: {
    position: "absolute",
    top: 15,
    right: 0,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  searchSortContainer: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    backgroundColor: "#FFF",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#4B6CB7",
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default AttendanceHistory;
