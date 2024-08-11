import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import axios from '../axiosConfig'; // Adjust the import path as necessary
import messaging from '@react-native-firebase/messaging';

const StaffOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage.data.orderId) {
        // Refresh orders if the notification contains an orderId
        fetchOrders();
      }
    });

    return unsubscribe;
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      const sortedData = response.data.sort((a, b) => (a.status === 'pending' ? -1 : 1));
      setOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const response = await axios.patch(`/orders/${id}`, { status });

      if (response.status === 200) {
        // Update state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        );
        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        );
        // Send push notification to user
        const order = orders.find(order => order.id === id);
        await messaging().sendToDevice(order.user_fcm_token, {
          notification: {
            title: 'Order Status Update',
            body: `Your order has been ${status}!`,
          },
        });
      } else {
        console.error(`Unexpected HTTP status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount); // Convert string to number
    }
    return isNaN(amount) ? '0.00' : amount.toFixed(2); // Handle NaN cases
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = orders.filter(order =>
      order.user_email.toLowerCase().includes(text.toLowerCase()) ||
      order.user_name.toLowerCase().includes(text.toLowerCase()) ||
      order.user_phone.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

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
            <Text>Total: ${formatAmount(item.totalAmount)}</Text>
            <Text>Status: {item.status}</Text>
            <View style={styles.buttonContainer}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleOrderStatus(item.id, 'accepted')}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleOrderStatus(item.id, 'rejected')}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userEmail: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StaffOrdersScreen;
