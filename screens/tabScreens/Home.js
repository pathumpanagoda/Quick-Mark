import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import HandImg from "../../assets/hand.png";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const HomeScreen = () => {
  const navigation = useNavigation();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userName, setUserName] = useState("");

  // State for date range and stats
  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "User Name");
    } else {
      setUserName("User Name");
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const formattedHours = hours % 12 || 12;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${formattedHours}:${paddedMinutes} ${ampm}`;
  };

  const calculateAnalytics = (records) => {
    const totalAttendance = records.length;
    const totalEarnings = records.reduce((sum, record) => {
      return sum + (parseFloat(record.amount) || 0);
    }, 0);

    setTotalEarnings(totalEarnings);
    setTotalAttendance(totalAttendance);
  };

  const fetchAttendanceRecords = useCallback(async () => {
    if (!userId) {
      console.error("You must be logged in to view attendance records");
      return;
    }

    try {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, "users", userId, "attendance")
      );

      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date),
      }));

      const filteredRecords = records.filter((record) => {
        const recordDate = new Date(record.date);
        const recordDateMidnight = new Date(
          recordDate.getFullYear(),
          recordDate.getMonth(),
          recordDate.getDate()
        );
        const startDateMidnight = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const endDateMidnight = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        return (
          recordDateMidnight >= startDateMidnight &&
          recordDateMidnight <= endDateMidnight
        );
      });

      calculateAnalytics(filteredRecords);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  }, [userId, startDate, endDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAttendanceRecords();
    setIsRefreshing(false);
  };

  const handleDateChange = (type, selectedDate) => {
    if (selectedDate) {
      if (type === "start") {
        setStartDate(selectedDate);
        setShowStartPicker(false);
      } else if (type === "end") {
        setEndDate(selectedDate);
        setShowEndPicker(false);
      }
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceRecords();
    }, [fetchAttendanceRecords])
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.imageContainer}>
              <View style={styles.defaultImage}>
                <FontAwesome name="user" size={40} color="#FFF" />
              </View>
            </View>
            <View>
              <Text style={styles.title}>{userName}</Text>
              <Text style={styles.subtitle}>Welcome back!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <MaterialCommunityIcons name="bell" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Container */}
      <View style={styles.sectionContainer}>
        {/* Clock Section */}
        <View style={styles.clockContainer}>
          <Text style={styles.time}>{formatTime()}</Text>
          <Text style={styles.date}>
            {currentDateTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.clockInButton}
            onPress={() => navigation.navigate("MarkAttendance")}
          >
            <LinearGradient
              colors={["#C865DA", "#5C99D6"]}
              style={styles.gradientButton}
            >
              <Image source={HandImg} style={{ width: 90, height: 80 }} />
              <Text style={styles.clockInText}>CHECK IN</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Date Range Section */}
        <View style={styles.verticalLineContainer}>
          <View style={styles.verticalLine} />
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={styles.datePicker}
            >
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateDash}> - </Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={styles.datePicker}
            >
              <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={["#FF7EB3", "#A963D4"]} style={styles.statBox}>
            <Text style={styles.statLabel}>Total Earnings(Rs.)</Text>
            <Text style={styles.statValue}>{totalEarnings.toFixed(2)}</Text>
          </LinearGradient>
          <LinearGradient colors={["#4CA1AF", "#5C99D6"]} style={styles.statBox}>
            <Text style={styles.statLabel}>Total Attendance</Text>
            <Text style={styles.statValue}>{totalAttendance}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(_event, selectedDate) =>
            handleDateChange("start", selectedDate)
          }
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(_event, selectedDate) => handleDateChange("end", selectedDate)}
        />
      )}

      {/* Grid Section */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("AddCustomer")}
          >
            <FontAwesome5 name="user-plus" size={24} color="#4B6CB7" />
            <Text style={styles.gridText}>Add Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("ManageCustomers")}
          >
            <FontAwesome5 name="users" size={24} color="#4B6CB7" />
            <Text style={styles.gridText}>Manage Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("AttendanceHistory")}
          >
            <FontAwesome5 name="history" size={24} color="#4B6CB7" />
            <Text style={styles.gridText}>Attendance History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("InsightsPage")}
          >
            <FontAwesome5 name="chart-bar" size={24} color="#4B6CB7" />
            <Text style={styles.gridText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 120,
    backgroundColor: "#536bb3",
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ensures the notification icon is on the right
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "right",
  },
  notificationIcon: {
    padding: 10, // Adds touchable padding around the icon
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    elevation: 3, // For Android shadow
    shadowColor: "#767676", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: -100,
    marginHorizontal: 20,
  },
  verticalLineContainer: {
    alignItems: "center",
    marginBottom: 0,
  },
  verticalLine: {
    width: "95%",
    height: 2,
    backgroundColor: "#E3E3E3",
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -15,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#767676",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  datePicker: {
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B6CB7",
  },
  dateDash: {
    fontSize: 16,
    color: "#4B6CB7",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "white",
    fontSize: 16,
  },
  clockContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  time: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  date: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  clockInButton: {
    alignItems: "center",
  },
  gradientButton: {
    padding: 20,
    width: 150,
    height: 150,
    alignItems: "center",
    borderRadius: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: "lightgray",
    borderWidth: 4,
  },
  clockInText: {
    color: "white",
    fontSize: 15,
    fontWeight: "normal",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    marginTop: 20,
  },
  statBox: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "45%",
  },
  statLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    justifyContent: "center",
  },
  statValue: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: 20,
  },
  gridButton: {
    width: "45%",
    backgroundColor: "#EEF2FA",
    padding: 1,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#9EBCD4",
    borderWidth: 2,
  },
  gridText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4B6CB7",
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E5E5E5",
  },
  imageContainer: {
    alignItems: "center",
    marginRight: 10,
  },
  defaultImage: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: "#9EBCD4",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
