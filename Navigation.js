import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/tabScreens/Home";
import Settings from "./screens/tabScreens/Settings";
import Reports from "./screens/tabScreens/Reports";
import AddCustomer from "./screens/AddCustomer";
import ManageCustomers from "./screens/ManageCustomers";
import CustomerDetails from "./screens/CustomerDetails";
import EditCustomerDetails from "./screens/EditCustomerDetails";
import MarkAttendance from "./screens/MarkAttendance";
import AttendanceHistory from "./screens/AttendanceHistory";
import UpdateAttendance from "./screens/UpdateAttendance";
import InsightsPage from "./screens/InsightsPage";
import LoginScreen from "./screens/(auth)/LoginScreen";
import SignupScreen from "./screens/(auth)/SignupScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Stack navigator
function HomeStackGroup({ isLoggedIn }) {
  return (
    <HomeStack.Navigator
      initialRouteName={isLoggedIn ? "TabGroup" : "LoginScreen"} // Set Home or Login as the initial route based on login state
      screenOptions={{
        headerShown: false,
        navigationBarColor: "transparent",
      }}
    >
      {/* LoginScreen as the initial screen */}
      <HomeStack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ animation: "fade" }}
      />
      <HomeStack.Screen name="TabGroup" component={TabGroup} />
      <HomeStack.Screen
        name="AddCustomer"
        component={AddCustomer}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="ManageCustomers"
        component={ManageCustomers}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="CustomerDetails"
        component={CustomerDetails}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="EditCustomerDetails"
        component={EditCustomerDetails}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="MarkAttendance"
        component={MarkAttendance}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="AttendanceHistory"
        component={AttendanceHistory}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="UpdateAttendance"
        component={UpdateAttendance}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="InsightsPage"
        component={InsightsPage}
        options={{ animation: "simple_push" }}
      />
      <HomeStack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{ animation: "fade" }}
      />
    </HomeStack.Navigator>
  );
}

// Bottom tab navigator
function TabGroup() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "Category") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: "#4B6CB7",
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, tabBarLabel: "Home", animation: "fade" }}
      />
      <Tab.Screen
        name="Category"
        component={Reports}
        options={{ animation: "fade" }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ animation: "fade" }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation({ isLoggedIn }) {
  return (
    <NavigationContainer>
      <HomeStackGroup isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
}
