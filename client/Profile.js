import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Circle } from 'react-native-svg';
import { UserContext } from './UserContext';
import { getTestResults, getMoodHistory, submitMood } from './api';

export default function Profile({ navigation }) {
  const { user } = useContext(UserContext);

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const moods = [
    { id: 'frustrated', label: 'Frustrated', image: require('./assets/images/frustrated.png') },
    { id: 'sad', label: 'Sad', image: require('./assets/images/downcast.png') },
    { id: 'calm', label: 'Calm', image: require('./assets/images/calm.png') },
    { id: 'happy', label: 'Happy', image: require('./assets/images/happy.png') },
    { id: 'excited', label: 'Excited', image: require('./assets/images/excited.png') },
  ];

  const moodScale = {
    frustrated: 1,
    sad: 2,
    calm: 3,
    happy: 4,
    excited: 5,
  };

  const moodColors = {
    frustrated: '#8B0000',
    sad: '#4B6C8B',
    calm: '#808080',
    happy: '#FFD700',
    excited: '#FF69B4',
  };

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood.id);
    alert(`You selected: ${mood.label}`);
    try {
      await submitMood(user.id, mood.id);
      fetchMoodHistory();
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const history = await getMoodHistory(user.id);
      setMoodHistory(history);
    } catch (err) {
      console.error("Failed to fetch mood history", err);
    }
  };

  useEffect(() => {
    if (selectedTab === 'Mood Tracker') {
      fetchMoodHistory();
    }
  }, [selectedTab]);

  const moodChartData = {
    labels: moodHistory.map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: moodHistory.map(entry => moodScale[entry.mood] || 0),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      },
    ],
  };

  const getMoodColor = (moodId) => moodColors[moodId] || '#2C3E50';

  const userProfileImage = require('./assets/images/user_avatar.png');
  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Mood Tracker');

  const fetchTestResults = async () => {
    try {
      setLoadingResults(true);
      const data = await getTestResults(user.id);
      setTestResults(data);
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBackground}>
        <Image source={require('./assets/images/logo_half.png')} style={styles.logo} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('TakeTest')} style={styles.iconCircle}>
            <Image source={require('./assets/images/test_icon.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconCircle}>
            <Image source={require('./assets/images/setting_icon.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Image source={userProfileImage} style={styles.profileImage} />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Mood Tracker' && styles.activeTab]}
            onPress={() => setSelectedTab('Mood Tracker')}
          >
            <Text style={[styles.tabText, selectedTab === 'Mood Tracker' && styles.activeTabText]}>Mood Tracker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Test Result' && styles.activeTab]}
            onPress={() => {
              setSelectedTab('Test Result');
              fetchTestResults();
            }}
          >
            <Text style={[styles.tabText, selectedTab === 'Test Result' && styles.activeTabText]}>Test Result</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'Mood Tracker' && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodButton, selectedMood === mood.id && styles.selectedMood]}
                  onPress={() => handleMoodClick(mood)}
                >
                  <Image source={mood.image} style={styles.moodImage} />
                </TouchableOpacity>
              ))}
            </View>

            {moodHistory.length > 0 && (
              <LineChart
              data={moodChartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              segments={4} // 5 moods = 4 intervals
              fromZero={false}
              withDots={true}
              withInnerLines={true}
              yAxisInterval={1}
              formatYLabel={(value) => {
                const moodLabels = {
                  1: 'Frustrated',
                  2: 'Sad',
                  3: 'Calm',
                  4: 'Happy',
                  5: 'Excited',
                };
                return moodLabels[Math.round(value)] || '';
              }
              }

              withDots={true}
              chartConfig={{
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                decimalPlaces: 0,
                color: () => '#000',
                labelColor: () => '#000',
                propsForBackgroundLines: {
                  strokeDasharray: '9',
                  strokeWidth: 0.5,
                  stroke: '#E0E0E0', 
                },
              }}
              bezier
              style={styles.chart}
              getDotProps={(value, index) => {
                const mood = moodHistory[index]?.mood;
                const color = moodColors[mood] || '#2C3E50';
                return {
                  r: '5',
                  strokeWidth: 3,
                  stroke: '#fff',
                  fill: color,
                };
              }}
            />
            


            )}
          </View>
        )}

        {selectedTab === 'Test Result' && (
          <View style={styles.testResult}>
            {loadingResults ? (
              <Text style={styles.testResultText}>Loading...</Text>
            ) : testResults.length === 0 ? (
              <Text style={styles.testResultText}>You haven't taken any test yet 📝</Text>
            ) : (
              testResults.map((result, index) => (
                <View key={index} style={styles.resultCard}>
                  <Text style={styles.resultDate}>🗓 {new Date(result.created_at).toLocaleDateString()}</Text>
                  <Text>🔥 Emotional Exhaustion: {result.emotional_exhaustion_score} ({result.emotional_exhaustion_level})</Text>
                  <Text>🧊 Depersonalization: {result.depersonalization_score} ({result.depersonalization_level})</Text>
                  <Text>🌟 Personal Accomplishment: {result.personal_accomplishment_score} ({result.personal_accomplishment_level})</Text>
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>🧠 Burnout Level: {result.burnout_level}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}>
          <Image source={require('./assets/images/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('./assets/images/search.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
          <Image source={require('./assets/images/chat.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('./assets/images/profile_choose.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'top', 
    },
    logoBackground: {
        width: '100%',
        height: Dimensions.get('window').width / 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
        opacity: .4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 54,
        top: 10,
    },
    icon: {
        width: 40,
        height: 40,
    },
    iconCircle: {
        width: 55,
        height: 55,
        borderRadius: 25, 
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5, 
        opacity: .7,
    },
    userInfo: {
      alignItems: 'center',
      bottom: -5, 
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: '#FFF',
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 10,
      marginTop: 24,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginHorizontal: 5,
      backgroundColor: '#B8CDD9',
    },
    activeTab: {
      backgroundColor: '#5D92B1',
    },
    tabText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#666',
    },
    activeTabText: {
      color: '#000',
    },
    moodColor: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    chart: {
      marginVertical: 20,
      borderRadius: 10,
    },
    streaks: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#E0E0E0',
      padding: 10,
      borderRadius: 10,
    },
    streakItem: {
      alignItems: 'center',
    },
    streakIcon: {
      fontSize: 24,
      marginBottom: 5,
    },
    streakText: {
      fontSize: 14,
      color: '#666',
    },
    streakValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    testResult: {
      marginTop: 20,
      padding: 20,
      backgroundColor: '#DFF9DC',
      borderRadius: 10,
    },
    testResultText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
      backgroundColor: '#E0E0E0',
    },
    navItem: {
      padding: 10,
    },
    navIcon: {
      width: 30,
      height: 30,
    },

    resultCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 18,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    resultDate: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333',
    },
    
    resultItem: {
      fontSize: 15,
      marginVertical: 2,
      color: '#444',
    },

    moodButton: {
      marginHorizontal: 5,
      width: 48,   // Smaller button size
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#B8CDD9',
    },
    selectedMood: {
      backgroundColor: '#5D92B1',
    },
    moodImage: {
      width: 28,   // Smaller image
      height: 28,
    },
    
    
  });
  