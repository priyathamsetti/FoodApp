import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from '../axiosConfig';
import CartContext from '../context/CartContext';

const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { cartItems, addToCart } = useContext(CartContext);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('/food-items');
      const availableItems = response.data.filter(item => item.available === 1); // Filter for available items
      const updatedItems = availableItems
        .map(item => ({
          ...item,
          price: parseFloat(item.price), // Ensure price is a number
          quantity: 0 // Initialize quantity to zero
        }));
      setFoodItems(updatedItems);
    } catch (error) {
      console.error('Error fetching food items:', error.message); // Log detailed error
      alert('Failed to fetch food items. Please try again later.'); // User-friendly error message
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset quantities to zero when the screen is focused
      setFoodItems(prevItems =>
        prevItems.map(item => ({ ...item, quantity: 0 }))
      );
    }, [])
  );

  const updateQuantity = (id, increment) => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      )
    );

    if (increment > 0) {
      addToCart({
        ...foodItems.find(item => item.id === id),
        quantity: increment
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodItems().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>${item.price ? item.price.toFixed(2) : 'N/A'}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity onPress={() => navigation.navigate('UserCart')} style={styles.navButton}>
          <View style={styles.iconContainer}>
            <Text style={styles.navIcon}>🛒</Text>
            {cartItems.length > 0 && (
              <View style={styles.cartCountContainer}>
                <Text style={styles.cartCountText}>{cartItems.reduce((total, item) => total + item.quantity, 0)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Checkout</Text>
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
  item: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  itemDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  quantityButton: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 20,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    position: 'relative',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  cartCountContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#ff8c00',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  navText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
});

export default UserFoodItemsScreen;
