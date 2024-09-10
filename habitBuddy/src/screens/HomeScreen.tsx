import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, Pressable, Alert, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Assume you fetch this from AsyncStorage or Redux

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/goals/getAllGoals');
        setGoals(response.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    if (!selectedGoal) {
      Alert.alert('Error', 'Please select a goal.');
      return;
    }

    try {
        const userid = await AsyncStorage.getItem("userId");
        const response = await axios.post('https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/goals/addUserGoal', {
            user_id: userid,
            goal_id: selectedGoal,
        });

        Alert.alert('Success', response.data.message);
        setModalVisible(false); // Close the modal
    } catch (error) {
      Alert.alert('Error', 'Failed to add goal.');
      console.error('Error adding goal:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      {/* Sticky button */}
      <Pressable style={styles.stickyButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>

      {/* Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Goal</Text>

            {/* Dropdown */}
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.goalItem,
                    { backgroundColor: selectedGoal === item.id ? '#d3d3d3' : 'white' }
                  ]}
                  onPress={() => setSelectedGoal(item.id)}
                >
                  <Text>{item.name}</Text>
                </Pressable>
              )}
            />

            <Button title="Submit" onPress={handleAddGoal} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stickyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#007bff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;
