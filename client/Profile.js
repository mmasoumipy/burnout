import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { UserContext } from './UserContext';
import { 
  getTestResults, 
  getMoodHistory, 
  submitMood, 
  getUserStreaks,
  getMicroAssessments 
} from './api';

export default function Profile({ navigation }) {
  const { user } = useContext(UserContext);

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [microAssessments, setMicroAssessments] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Mood Tracker');
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    weeklyCheckIns: 0,
    totalAssessments: 0
  });
  
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
    try {
      await submitMood(user.id, mood.id);
      await fetchMoodHistory();
      await fetchStreakData();
      Alert.alert('Mood recorded', `You're feeling ${mood.label.toLowerCase()} today.`);
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to record your mood.');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && selectedTab === 'Test Result') {
      fetchTestResults();
    }
  }, [selectedTab, user]);

  const fetchData = async () => {
    setLoadingResults(true);
    try {
      await Promise.all([
        fetchMoodHistory(),
        fetchTestResults(),
        fetchMicroAssessments(),
        fetchStreakData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const history = await getMoodHistory(user.id);
      setMoodHistory(history);
      return history;
    } catch (err) {
      console.error("Failed to fetch mood history", err);
      return [];
    }
  };

  const fetchTestResults = async () => {
    try {
      const data = await getTestResults(user.id);
      setTestResults(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch test results:', error);
      return [];
    }
  };

  const fetchMicroAssessments = async () => {
    try {
      const data = await getMicroAssessments(user.id);
      setMicroAssessments(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch micro assessments:', error);
      return [];
    }
  };

  const fetchStreakData = async () => {
    try {
      const data = await getUserStreaks(user.id);
      setStreakData(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        weeklyCheckIns: 0,
        totalAssessments: 0
      };
    }
  };

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
  
  // Generate calendar data for streak visualization
  const generateCalendarData = () => {
    const calendarData = [];
    const today = new Date();
    
    // Create array of the last 28 days (4 weeks)
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if there was a check-in on this date
      const moodEntry = moodHistory.find(m => 
        new Date(m.timestamp).toISOString().split('T')[0] === dateString
      );
      
      const testEntry = testResults.find(t => 
        new Date(t.created_at).toISOString().split('T')[0] === dateString
      );
      
      const microEntry = microAssessments.find(ma => 
        new Date(ma.created_at).toISOString().split('T')[0] === dateString
      );
      
      // Determine cell color based on check-in type
      let color = '#E0E0E0'; // Default: no check-in
      
      if (testEntry) {
        color = '#5D92B1'; // MBI test: blue
      } else if (microEntry) {
        color = '#99D9CA'; // Micro-assessment: teal
      } else if (moodEntry) {
        color = '#B5C7E3'; // Mood: light blue
      }
      
      // Add to calendar data
      calendarData.push({
        date: dateString,
        color,
        hasMood: !!moodEntry,
        hasTest: !!testEntry,
        hasMicro: !!microEntry
      });
    }
    
    return calendarData;
  };
  
  const calendarData = generateCalendarData();
  
  // Render streak calendar (similar to GitHub contribution calendar)
  const renderStreakCalendar = () => {
    // Split into weeks
    const weeks = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      weeks.push(calendarData.slice(i, i + 7));
    }
    
    // Calculate date range for title
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 27);
    
    const formatDateForDisplay = (date) => {
      const options = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    };
    
    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>
          Your Last 28 Days ({formatDateForDisplay(startDate)} - {formatDateForDisplay(today)})
        </Text>
        
        {/* Day labels (Sun, Mon, etc.) */}
        <View style={styles.dayLabelsContainer}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeek}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity 
                  key={dayIndex}
                  style={[styles.calendarDay, { backgroundColor: day.color }]}
                  onPress={() => {
                    if (day.hasMood || day.hasTest || day.hasMicro) {
                      // Parse date for display
                      const dayDate = new Date(day.date);
                      const formattedDate = formatDateForDisplay(dayDate);
                      
                      Alert.alert(
                        `Check-ins on ${formattedDate}`, 
                        `${day.hasMood ? '• Mood recorded\n' : ''}${day.hasTest ? '• MBI assessment taken\n' : ''}${day.hasMicro ? '• Quick wellness check completed' : ''}`
                      );
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </View>
        
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>No check-in</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#B5C7E3' }]} />
            <Text style={styles.legendText}>Mood</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#99D9CA' }]} />
            <Text style={styles.legendText}>Quick Check</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#5D92B1' }]} />
            <Text style={styles.legendText}>MBI Test</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render the streak metrics section
  const renderStreakMetrics = () => (
    <View style={styles.streakContainer}>
      <Text style={styles.streakTitle}>Your Wellness Streak</Text>
      
      <View style={styles.streakMetricsRow}>
        <View style={styles.streakMetric}>
          <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.streakMetric}>
          <Text style={styles.streakNumber}>{streakData.longestStreak}</Text>
          <Text style={styles.streakLabel}>Longest Streak</Text>
        </View>
        
        <View style={styles.streakMetric}>
          <Text style={styles.streakNumber}>{streakData.weeklyCheckIns}</Text>
          <Text style={styles.streakLabel}>Last 7 Days</Text>
        </View>
      </View>
      
      {renderStreakCalendar()}
      
      <View style={styles.streakNote}>
        <Text style={styles.streakNoteText}>
          Note: MBI assessments are recommended once a month. 
          Regular quick checks and mood tracking help maintain your streak.
        </Text>
      </View>
    </View>
  );

  // Render burnout score visualizations
  const renderBurnoutScores = () => {
    if (testResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't taken any burnout assessments yet.</Text>
          <TouchableOpacity 
            style={styles.takeTestButton}
            onPress={() => navigation.navigate('TakeTest')}
          >
            <Text style={styles.takeTestButtonText}>Take MBI Assessment</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const latestResult = testResults[0]; // Assuming results are ordered by date
    
    return (
      <View>
        <View style={styles.burnoutCard}>
          <Text style={styles.burnoutCardTitle}>
            Your Burnout Status: {latestResult.burnout_level}
          </Text>
          <Text style={styles.burnoutCardDate}>
            Last assessed: {new Date(latestResult.created_at).toLocaleDateString()}
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Emotional Exhaustion</Text>
            <View style={styles.scoreBarContainer}>
              <View 
                style={[
                  styles.scoreBar, 
                  { 
                    width: `${(latestResult.emotional_exhaustion_score / 54) * 100}%`,
                    backgroundColor: latestResult.emotional_exhaustion_level === 'High' ? '#E74C3C' : 
                                    latestResult.emotional_exhaustion_level === 'Moderate' ? '#F5A623' : '#27AE60'
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreValue}>
              {latestResult.emotional_exhaustion_score}/54 ({latestResult.emotional_exhaustion_level})
            </Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Depersonalization</Text>
            <View style={styles.scoreBarContainer}>
              <View 
                style={[
                  styles.scoreBar, 
                  { 
                    width: `${(latestResult.depersonalization_score / 30) * 100}%`,
                    backgroundColor: latestResult.depersonalization_level === 'High' ? '#E74C3C' : 
                                    latestResult.depersonalization_level === 'Moderate' ? '#F5A623' : '#27AE60'
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreValue}>
              {latestResult.depersonalization_score}/30 ({latestResult.depersonalization_level})
            </Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Personal Accomplishment</Text>
            <View style={styles.scoreBarContainer}>
              <View 
                style={[
                  styles.scoreBar, 
                  { 
                    width: `${(latestResult.personal_accomplishment_score / 48) * 100}%`,
                    backgroundColor: latestResult.personal_accomplishment_level === 'Low' ? '#E74C3C' : 
                                    latestResult.personal_accomplishment_level === 'Moderate' ? '#F5A623' : '#27AE60'
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreValue}>
              {latestResult.personal_accomplishment_score}/48 ({latestResult.personal_accomplishment_level})
            </Text>
          </View>
          
          {/* Insight and recommendation section */}
          <View style={styles.insightContainer}>
            <Text style={styles.insightTitle}>Insights</Text>
            <Text style={styles.insightText}>
              {latestResult.burnout_level === 'High' 
                ? 'Your results indicate high burnout risk. Consider reducing workload and seeking support.'
                : latestResult.burnout_level === 'Moderate'
                ? 'Your results show moderate burnout risk. Focus on self-care and emotional boundaries.'
                : 'Your burnout risk is currently low. Continue practicing your wellness strategies.'}
            </Text>
            
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                {latestResult.emotional_exhaustion_level === 'High' 
                  ? 'Try the Micro-Resilience exercises to restore your energy levels.'
                  : latestResult.depersonalization_level === 'High'
                  ? 'Practice mindfulness techniques to reconnect with your purpose and patients.'
                  : 'Focus on celebrating your accomplishments to maintain your wellbeing.'}
              </Text>
              
              <TouchableOpacity 
                style={styles.recommendationButton}
                onPress={() => navigation.navigate('MicroAssessment')}
              >
                <Text style={styles.recommendationButtonText}>
                  Try Micro-Resilience Exercises
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Historical Test Results */}
        {testResults.length > 1 && (
          <View style={styles.historicalContainer}>
            <Text style={styles.historicalTitle}>Previous Assessments</Text>
            {testResults.slice(1).map((result, index) => (
              <View key={index} style={styles.historicalItem}>
                <Text style={styles.historicalDate}>
                  {new Date(result.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.historicalScore}>
                  Burnout Level: {result.burnout_level}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBackground}>
        <Image source={require('./assets/images/logo_half.png')} style={styles.logo} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('TakeTest')} style={styles.iconCircle}>
            <Image source={require('./assets/images/test_icon.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Setting')} style={styles.iconCircle}>
            <Image source={require('./assets/images/setting_icon.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Image source={userProfileImage} style={styles.profileImage} />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
      </View>
  
      <View style={styles.mainContent}>
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
                  }}
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
              
              {/* Streak Metrics Section - Moved here after the mood graph */}
              {renderStreakMetrics()}
            </View>
          )}
  
          {selectedTab === 'Test Result' && (
            <View style={styles.testResult}>
              {loadingResults ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#5D92B1" />
                  <Text style={styles.loadingText}>Loading test results...</Text>
                </View>
              ) : (
                renderBurnoutScores()
              )}
            </View>
          )}
        </ScrollView>
      </View>
  
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
    backgroundColor: '#FAF9F6',
  },
  mainContent: {
    flex: 1,
    marginBottom: 50,  // Add space for navbar
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  streakContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  streakMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  streakMetric: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D92B1',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakNote: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#5D92B1',
  },
  streakNoteText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  dayLabel: {
    fontSize: 12,
    color: '#888',
    width: (Dimensions.get('window').width - 90) / 7,
    textAlign: 'center',
  },
  calendarContainer: {
    marginTop: 10,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  calendarGrid: {
    marginVertical: 15,
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: (Dimensions.get('window').width - 90) / 7,
    height: (Dimensions.get('window').width - 90) / 7,
    borderRadius: 5,
    margin: 1,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
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
  chart: {
    marginVertical: 20,
    borderRadius: 10,
  },
  moodButton: {
    marginHorizontal: 5,
    width: 48,
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
    width: 28,
    height: 28,
  },
  testResult: {
    marginTop: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  takeTestButton: {
    backgroundColor: '#5D92B1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  takeTestButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  burnoutCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  burnoutCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  burnoutCardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreBarContainer: {
    height: 14,
    backgroundColor: '#F1F1F1',
    borderRadius: 7,
  },
  scoreBar: {
    height: 14,
    borderRadius: 7,
  },
  scoreValue: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
  insightContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  recommendationBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 15,
  },
  recommendationButton: {
    backgroundColor: '#5D92B1',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recommendationButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  historicalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historicalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  historicalDate: {
    fontSize: 14,
    color: '#666',
  },
  historicalScore: {
    fontSize: 14,
    fontWeight: '500',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navItem: {
    padding: 10,
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});