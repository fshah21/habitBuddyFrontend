import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, Pressable, Alert, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [matchedGoals, setMatchedGoals] = useState<any[]>([]);
  const [unmatchedGoals, setUnmatchedGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Assume you fetch this from AsyncStorage or Redux

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        
        const response = await axios.post('https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/matches/getUserGoalMatches', {
          user_id: userId,
        });

        console.log("RESPONSE DATA", response.data);

        const matchedGoals = response.data.matched;

         // Fetch goal details and user details
        const goalsWithDetails = await Promise.all(matchedGoals.map(async (goalMatch: any) => {
        const goalResponse = await axios.get(`https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/goals/${goalMatch.goal_id}`);
        const userResponse = await axios.get(`https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/users/${goalMatch.matched_with}`);
          
          return {
            ...goalMatch,
            goalName: goalResponse.data.name,
            matchedWithName: userResponse.data.name,
          };
        }));

        const unmatchedGoals = response.data.unmatched;

        const unmatchedGoalsWithDetails = await Promise.all(unmatchedGoals.map(async (goalMatch: any) => {
          const goalResponse = await axios.get(`https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/goals/${goalMatch.goal_id}`);
            
            return {
              ...goalMatch,
              goalName: goalResponse.data.name,
            };
          }));

        setMatchedGoals(goalsWithDetails);
        setUnmatchedGoals(unmatchedGoalsWithDetails);
      } catch (error) {
        console.error('Error fetching user goals:', error);
      }
    };

    const fetchGoals = async () => {
      try {
        const response = await axios.get('https://asia-south1-habitbuddy-d67d1.cloudfunctions.net/userservice/getAllGoals');
        setGoals(response.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchUserGoals();
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
      
      {/* Matched Goals Section */}
      <Text style={styles.sectionTitle}>Matched Goals</Text>
      <FlatList
        data={matchedGoals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <Text style={styles.goalName}>{item.goalName} </Text> 
            <Text>with</Text>
            <Text style={styles.goalName}> {item.matchedWithName}</Text>
          </View>
        )}
      />

      {/* Unmatched Goals Section */}
      <Text style={styles.sectionTitle}>Unmatched Goals</Text>
      <FlatList
        data={unmatchedGoals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalItemUnmatched}>
            <Text style={styles.goalName}>{item.goalName}</Text>
          </View>
        )}
      />

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
                    styles.goalItemUnmatched,
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
  goalItemUnmatched: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 8
  },
  goalItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%', // Ensures the item takes the full width
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Center items vertically
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4, // Adds some space below the goal name
  },
  matchedWithName: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
