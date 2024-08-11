import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from '../axiosConfig';
import { useNavigation } from '@react-navigation/native';

const StaffFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch food items from the server
    axios.get('/food-items') // Ensure this URL is correct
      .then(response => {
        setFoodItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching food items:', error.message);
        setLoading(false);
      });
  }, []);

  const toggleAvailability = (id) => {
    const item = foodItems.find(item => item.id === id);
    if (item) {
      axios.put(`/food-items/${id}`, { available: !item.available })
        .then(response => {
          setFoodItems(prevItems =>
            prevItems.map(item =>
              item.id === id
                ? { ...item, available: !item.available }
                : item
            )
          );
        })
        .catch(error => {
          console.error('Error updating food item availability:', error.message);
        });
    }
  };

  const handleLogout = () => {
    // Clear user data or any other logout logic here
    global.userProfile = null;
    navigation.navigate('Auth'); // Navigate to Auth screen for login
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading food items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <TouchableOpacity
                onPress={() => toggleAvailability(item.id)}
                style={[styles.availabilityButton, { backgroundColor: item.available ? '#4CAF50' : '#F44336' }]}
              >
                <Text style={styles.availabilityButtonText}>
                  {item.available ? '✔️ Available' : '❌ Not Available'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity onPress={() => navigation.navigate('StaffOrders')} style={styles.navButton}>
          <View style={styles.iconContainer}>
            <Text style={styles.navIcon}>📋</Text>
          </View>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.navButton}>
          <View style={styles.iconContainer}>
            <Text style={styles.navIcon}>🚪</Text>
          </View>
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    paddingBottom: 70, // To ensure the FlatList content is not hidden behind the bottom navigation
  },
  item: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  availabilityButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  availabilityButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
  },
  navButton: {
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
});

export default StaffFoodItemsScreen;
