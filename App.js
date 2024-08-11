import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import messaging from '@react-native-firebase/messaging';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import UserFoodItemsScreen from './src/screens/UserFoodItemsScreen';
import UserCartScreen from './src/screens/UserCartScreen';
import StaffFoodItemsScreen from './src/screens/StaffFoodItemsScreen';
import StaffOrdersScreen from './src/screens/StaffOrdersScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import AccountScreen from './src/screens/AccountScreen';
import AuthScreen from './src/screens/AuthScreen'; // Include AuthScreen for login
import SignUpScreen from './src/screens/SignUpScreen'; // Include SignUpScreen for registration

const Stack = createStackNavigator();

const App = () => {
  // Requesting user permission for notifications
  async function requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  }

  // Getting the FCM token
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('Token =', token);
    } catch (error) {
      console.error('Error getting token:', error);
    }
  };

  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);

  return (
    <CartProvider>
      <OrdersProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="UserFoodItems" component={UserFoodItemsScreen} />
            <Stack.Screen name="UserCart" component={UserCartScreen} />
            <Stack.Screen name="StaffFoodItems" component={StaffFoodItemsScreen} />
            <Stack.Screen name="StaffOrders" component={StaffOrdersScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </OrdersProvider>
    </CartProvider>
  );
};

export default App;
