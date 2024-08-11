import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import CartContext from '../context/CartContext';
import OrdersContext from '../context/OrdersContext';
import axios from '../axiosConfig';

const UserCartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, calculateTotal, clearCart, removeFromCart } = useContext(CartContext);
  const { addOrder } = useContext(OrdersContext);
  const [userProfile, setUserProfile] = useState({});

  useEffect(() => {
    // Ensure user profile is loaded
    if (global.userProfile) {
      setUserProfile(global.userProfile);
    } else {
      console.error('User profile is not available.');
    }
  }, []);

  const increaseQuantity = (itemId) => {
    updateQuantity(itemId, cartItems.find((item) => item.id === itemId).quantity + 1);
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  const placeOrder = async () => {
    const newOrder = {
      userEmail: userProfile.email || 'user@example.com',
      userName: userProfile.name || 'Anonymous',
      userPhone: userProfile.phone || '0000000000',
      items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', '),
      totalAmount: calculateTotal(),
      status: 'pending'
    };

    try {
      const response = await axios.post('/place-order', newOrder);
      if (response.data.success) {
        addOrder({ ...newOrder, id: response.data.orderId });

        // Send notification to staff
        await sendNotificationToStaff({
          title: 'New Order Received',
          body: `New order from ${newOrder.userName}.`,
          data: {
            orderId: response.data.orderId.toString(),
          },
        });

        Alert.alert('Order Placed', 'Thank you for your order!');
        clearCart();
        navigation.navigate('Orders');
      } else {
        Alert.alert('Failed to Place Order', 'Please try again later.');
      }
    } catch (error) {
      console.error('Error placing order:', error.response || error.message);
      Alert.alert('Error', 'There was an issue placing your order. Please try again.');
    }
  };

  const sendNotificationToStaff = async (notification) => {
    try {
      const serverKey = 'YOUR_SERVER_KEY'; // Replace with your Firebase server key
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: '/topics/staff',
          notification: notification,
          data: notification.data,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${serverKey}`,
          },
        }
      );
      console.log('Notification sent:', response.data);
    } catch (error) {
      console.error('Error sending notification:', error.response || error.message);
    }
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <Button title="-" onPress={() => decreaseQuantity(item.id)} color="#ff8c00" />
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Button title="+" onPress={() => increaseQuantity(item.id)} color="#ff8c00" />
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={styles.total}>Total: ${calculateTotal().toFixed(2)}</Text>
          <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default UserCartScreen;
