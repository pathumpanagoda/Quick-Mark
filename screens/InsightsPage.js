import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../FirebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const Analytics = () => {
  const auth = getAuth(); // Get Firebase Authentication instance
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get current user's UID

  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState({
    totalAttendance: 0,
    totalCustomers: 0,
    totalEarnings: 0,
    customerAttendanceCount: [],
  });

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
      calculateAnalytics(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      Alert.alert("Error", "Failed to load attendance records.");
    }
  };

  const calculateAnalytics = (records) => {
    const totalAttendance = records.length;
    const customerSet = new Set();
    let totalEarnings = 0;
    const customerAttendanceMap = {};

    records.forEach((record) => {
      totalEarnings += parseFloat(record.amount);
      customerSet.add(record.customer);

      if (customerAttendanceMap[record.customer]) {
        customerAttendanceMap[record.customer]++;
      } else {
        customerAttendanceMap[record.customer] = 1;
      }
    });

    const customerAttendanceCount = Object.entries(customerAttendanceMap)
      .sort((a, b) => b[1] - a[1]) // Sort by attendance count (descending)
      .map(([customer, count]) => ({ customer, count }));

    setAnalytics({
      totalAttendance,
      totalCustomers: customerSet.size,
      totalEarnings,
      customerAttendanceCount,
    });
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome name="arrow-left" size={24} color="#4B6CB7" />
        <Text style={styles.backButtonText}>Business Analytics</Text>
      </TouchableOpacity>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Attendance</Text>
          <Text style={styles.summaryCardValue}>
            {analytics.totalAttendance}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Customers</Text>
          <Text style={styles.summaryCardValue}>
            {analytics.totalCustomers}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Earnings</Text>
          <Text style={styles.summaryCardValue}>
            Rs. {analytics.totalEarnings.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Customer Attendance Table */}
      <Text style={styles.tableTitle}>Customer Attendance</Text>
      <ScrollView horizontal style={styles.tableContainer}>
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.customerColumn]}>
              Customer
            </Text>
            <Text style={[styles.headerCell, styles.attendanceColumn]}>
              Visits
            </Text>
          </View>

          {/* Table Rows */}
          {analytics.customerAttendanceCount.map((item, index) => (
            <View
              key={item.customer}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.alternateRow : null,
              ]}
            >
              <Text style={[styles.tableCell, styles.customerColumn]}>
                {item.customer}
              </Text>
              <Text style={[styles.tableCell, styles.attendanceColumn]}>
                {item.count}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 20,
    color: "#555",
    fontWeight: "bold",
    marginLeft: "21%",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "30%",
    shadowColor: "#BDC3C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  summaryCardTitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27AE60",
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495E",
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#BDC3C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ECF0F1",
    paddingVertical: 12,
  },
  headerCell: {
    fontWeight: "bold",
    color: "#2C3E50",
    paddingHorizontal: 20,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
  },
  alternateRow: {
    backgroundColor: "#F4F6F7",
  },
  tableCell: {
    color: "#7F8C8D",
    paddingHorizontal: 20,
  },
  customerColumn: {
    width: 220,
  },
  attendanceColumn: {
    width: 120,
    textAlign: "right",
  },
});

export default Analytics;
