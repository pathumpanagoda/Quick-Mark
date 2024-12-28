import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig'; // Import Firebase Auth
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

const Settings = () => {
    const [isEnabled, setIsEnabled] = React.useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const navigation = useNavigation();

    const handleLogout = () => {
        // Show a confirmation dialog
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => {
                        // Firebase sign-out logic
                        signOut(FIREBASE_AUTH)
                            .then(() => {
                                console.log('User logged out');
                                // Alert.alert('Logout', 'You have been logged out successfully.');
                                navigation.replace('LoginScreen'); // Navigate to the Login screen
                            })
                            .catch((error) => {
                                console.error('Error logging out:', error);
                                Alert.alert('Error', 'Failed to log out. Please try again.');
                            });
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            
            {/* Notifications Setting */}
            <View style={styles.settingItem}>
                <Text style={styles.settingText}>Enable Notifications</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>

            {/* Developer Details Section */}
            <View style={styles.developerSection}>
                <Text style={styles.sectionTitle}>Developer Details</Text>
                <View style={styles.developerInfo}>
                    <Text style={styles.developerText}>Name: Dilshan Pathum</Text>
                    <Text style={styles.developerText}>Email: pathumpanagoda@gmail.com</Text>
                    <Text style={styles.developerText}>GitHub: github.com/pathumpanagoda</Text>
                </View>
            </View>

            {/* Logout Button with Icon */}
            <View style={styles.logoutButton}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButtonContainer}>
                    <FontAwesome name="sign-out" size={24} color="#d9534f" style={styles.logoutIcon} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    settingText: {
        fontSize: 18,
        color: '#555',
    },
    developerSection: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    developerInfo: {
        marginTop: 10,
    },
    developerText: {
        fontSize: 16,
        color: '#777',
        marginBottom: 5,
    },
    logoutButton: {
        marginTop: 30,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
    },
    logoutButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        fontSize: 18,
        color: '#d9534f',
        fontWeight: 'bold',
    },
});

export default Settings;
