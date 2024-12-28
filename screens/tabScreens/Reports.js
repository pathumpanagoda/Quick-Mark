import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  Button,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";  // Import Ionicons for the back icon
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth";

const Report = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const fetchCategories = async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "You must be logged in to view categories.");
        return;
      }
      const querySnapshot = await getDocs(collection(FIREBASE_DB, "users", userId, "serviceCategories"));
      const categoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const handleAddCategory = async () => {
    if (!categoryName) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!userId) {
        Alert.alert("Error", "You must be logged in to add a category.");
        return;
      }

      const categoryData = { name: categoryName };
      const categoryRef = collection(FIREBASE_DB, "users", userId, "serviceCategories");
      await addDoc(categoryRef, categoryData);

      Alert.alert("Success", "Category added successfully!");
      setCategoryName("");
      fetchCategories();  // Refresh categories after adding
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("Error", "Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!newCategoryName) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryDoc = doc(FIREBASE_DB, "users", userId, "serviceCategories", categoryToEdit.id);
      await updateDoc(categoryDoc, { name: newCategoryName });

      Alert.alert("Success", "Category updated successfully!");
      fetchCategories();  // Refresh categories after editing
      setModalVisible(false); // Close the modal after updating
    } catch (error) {
      console.error("Error editing category:", error);
      Alert.alert("Error", "Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const categoryDoc = doc(FIREBASE_DB, "users", userId, "serviceCategories", id);
              await deleteDoc(categoryDoc);
  
              Alert.alert("Success", "Category deleted successfully!");
              fetchCategories();  // Refresh categories after deleting
            } catch (error) {
              console.error("Error deleting category:", error);
              Alert.alert("Error", "Failed to delete category. Please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Icon */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Service Categories</Text>
      </View>

      {/* Category Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleAddCategory}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Add Category"}</Text>
      </TouchableOpacity>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.name}</Text>

            <View style={styles.categoryActions}>
              <TouchableOpacity
                onPress={() => {
                  setCategoryToEdit(item);
                  setNewCategoryName(item.name);
                  setModalVisible(true);
                }}
              >
                <FontAwesome name="edit" size={20} color="#4B6CB7" style={styles.updateBtn} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                <FontAwesome name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for editing category */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter New Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleEditCategory}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>{isSubmitting ? "Updating..." : "Update Category"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderColor: "#DDD",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#4B6CB7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: "#B0C4DE",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateBtn: {
    marginRight: 15,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default Report;
