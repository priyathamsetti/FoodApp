import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from '../axiosConfig';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('/restaurants');
        setRestaurants(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    // Clear user data or any other logout logic here
    global.userProfile = null;
    navigation.navigate('Auth'); // Navigate to Auth screen for login
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADITYA FOODS</Text>
      <Text style={styles.subtitle}>Discover the best restaurants near you</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate('UserFoodItems')}
          >
            <Image source={{ uri: item.restaraunt_image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.restaurantName}>{item.restaraunt_name}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('Orders')}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('Account')}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>🚪</Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 70,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 15,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  location: {
    fontSize: 16,
    color: '#95a5a6',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ff8c00',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconText: {
    fontSize: 20,
    color: '#ff8c00',
  },
  navText: {
    color: '#ffffff',
    fontSize: 12,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default HomeScreen;
