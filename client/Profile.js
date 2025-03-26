import React, { useState, useContext } from 'react';
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
import { UserContext } from './UserContext';
import{ getTestResults } from './api';

export default function Profile({ navigation }) {
  const { user } = useContext(UserContext);
  // Dummy data
  
  const moods = [0, 2, 3, 4, 3, ]; // Mood data for the chart
  const streakData = { current: 3, longest: 12 }; // Dummy streaks
  
  const userProfileImage = require('./assets/images/user_avatar.png'); // Replace with actual image path
  const moodColors = ['#F9B9C3', '#F9D99B', '#D6C8F0', '#99C7F9', '#ADF5CE']; // Mood colors

  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const [selectedTab, setSelectedTab] = useState('Mood Tracker'); // Tab state

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
    {/* Logo Background */}
    <View style={styles.logoBackground}>
        <Image source={require('./assets/images/logo_half.png')} style={styles.logo} />

        {/* Header (Icons and User Info) */}
        <View style={styles.header}>
        <View >
            <TouchableOpacity onPress={() => navigation.navigate('TakeTest')} style={styles.iconCircle}>
                <Image source={require('./assets/images/test_icon.png')} style={styles.icon} />
            </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconCircle}>
            <Image source={require('./assets/images/setting_icon.png')} style={styles.icon} />
        </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
        <Image source={userProfileImage} style={styles.profileImage} />
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
    </View>

    {/* Main Content */}
     <ScrollView contentContainerStyle={styles.content}> 
        {/* Tabs */}
        <View style={styles.tabs}>
        <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Mood Tracker' && styles.activeTab]}
            onPress={() => setSelectedTab('Mood Tracker')}
        >
            <Text style={[styles.tabText, selectedTab === 'Mood Tracker' && styles.activeTabText]}>
            Mood Tracker
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Test Result' && styles.activeTab]}
            onPress={() => {
              setSelectedTab('Test Result')
              fetchTestResults();}
            }
        >
            <Text style={[styles.tabText, selectedTab === 'Test Result' && styles.activeTabText]}>
            Test Result
            </Text>
        </TouchableOpacity>
        </View>

        {/* Mood Tracker */}
        {selectedTab === 'Mood Tracker' && (
        <View>
            <View style={styles.moodColorsContainer}>
            {moodColors.map((color, index) => (
                <View key={index} style={[styles.moodColor, { backgroundColor: color }]} />
            ))}
            </View>
            <LineChart
            data={{
                labels: ['D1', 'D2', 'D3', 'D4', 'D5'], // X-axis labels
                datasets: [{ data: moods }], // Mood data
            }}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisLabel={''}
            yAxisSuffix={''}
            fromZero={true}
            yAxisInterval={1}
            formatYLabel={(value) => {
                const moodLabels = ['Frustrated', 'Sad', 'Calm', 'Happy', 'Excited'];
                return moodLabels[parseInt(value, 10) - 1] || '';
            }}
            chartConfig={{
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
            />
            <View style={styles.streaks}>
            <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>Current streak</Text>
                <Text style={styles.streakValue}>{streakData.current}</Text>
            </View>
            <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>⭐</Text>
                <Text style={styles.streakText}>Longest streak</Text>
                <Text style={styles.streakValue}>{streakData.longest}</Text>
            </View>
            </View>
        </View>
        )}

        {/* Test Result */}
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

    {/* Bottom Navigation */}
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
        justifyContent: 'center', 
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
      marginTop: 100,
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
    moodColorsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
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
    
  });
  