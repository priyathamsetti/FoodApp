import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl } from 'react-native';
import OrdersContext from '../context/OrdersContext'; // Adjust the import path as necessary
import axios from '../axiosConfig'; // Import the custom axios instance

const OrdersScreen = () => {
  const { orders } = useContext(OrdersContext); // Access orders from context
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: global.userProfile?.name || '',
    email: global.userProfile?.email || ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders'); // Use the custom axios instance
      const userOrders = response.data.filter(order =>
        order.user_email === userProfile.email && order.user_name === userProfile.name
      );
      setFilteredOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = filteredOrders.filter(order =>
      order.user_email.toLowerCase().includes(text.toLowerCase()) ||
      order.user_name.toLowerCase().includes(text.toLowerCase()) ||
      order.user_phone.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, [userProfile]);

  const formatAmount = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount); // Convert string to number
    }
    return isNaN(amount) ? '0.00' : amount.toFixed(2); // Handle NaN cases
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search orders..."
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.userEmail}>User: {item.user_email}</Text>
            <Text>Name: {item.user_name}</Text>
            <Text>Phone: {item.user_phone}</Text>
            <Text>Items: {item.items}</Text>
            <Text>Total: ${formatAmount(item.total_amount)}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  item: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
