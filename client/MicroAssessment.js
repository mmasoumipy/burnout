import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { UserContext } from './UserContext';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Add the micro-assessment API functions
import { 
  submitMicroAssessment, 
  getMicroAssessments, 
  getMicroAssessmentTrend 
} from './api';

// Custom Slider component to replace @react-native-community/slider
const CustomSlider = ({ minimumValue, maximumValue, value, onValueChange, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor }) => {
  const steps = maximumValue - minimumValue + 1;
  const stepElements = [];
  
  const handlePress = (newValue) => {
    onValueChange(newValue);
  };
  
  for (let i = minimumValue; i <= maximumValue; i++) {
    stepElements.push(
      <TouchableOpacity 
        key={i} 
        style={[
          styles.sliderStep,
          { backgroundColor: i <= value ? minimumTrackTintColor : maximumTrackTintColor },
          i === value && { backgroundColor: thumbTintColor, transform: [{ scale: 1.2 }] }
        ]}
        onPress={() => handlePress(i)}
      />
    );
  }
  
  return (
    <View style={styles.customSlider}>
      {stepElements}
    </View>
  );
};

export default function MicroAssessment({ navigation }) {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [trend, setTrend] = useState(null);
  
  // Form state
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [workSatisfaction, setWorkSatisfaction] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [supportFeeling, setSupportFeeling] = useState(3);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (showResults) {
      loadAssessmentData();
    }
  }, [showResults]);

  const loadAssessmentData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const assessmentsData = await getMicroAssessments(user.id);
      const trendData = await getMicroAssessmentTrend(user.id);
      
      setAssessments(assessmentsData);
      setTrend(trendData);
    } catch (error) {
      console.error('Error loading assessment data:', error);
      Alert.alert('Error', 'Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to submit an assessment');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = {
        user_id: user.id,
        fatigue_level: fatigueLevel,
        stress_level: stressLevel,
        work_satisfaction: workSatisfaction,
        sleep_quality: sleepQuality,
        support_feeling: supportFeeling,
        comments: comments.trim() || null
      };
      
      const result = await submitMicroAssessment(data);
      
      // Reset form
      setFatigueLevel(3);
      setStressLevel(3);
      setWorkSatisfaction(3);
      setSleepQuality(3);
      setSupportFeeling(3);
      setComments('');
      
      // Show results
      setShowResults(true);
      
      Alert.alert(
        'Assessment Submitted', 
        `Your current burnout risk score is ${result.burnout_risk_score}/10`
      );
    } catch (error) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Error', 'Failed to submit assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAssessmentForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.title}>Quick Wellness Check</Text>
      <Text style={styles.subtitle}>How are you feeling today?</Text>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Fatigue Level:</Text>
        <Text style={styles.sliderValue}>{fatigueLevel}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMinLabel}>Low</Text>
          <CustomSlider
            minimumValue={1}
            maximumValue={5}
            value={fatigueLevel}
            onValueChange={setFatigueLevel}
            minimumTrackTintColor="#5D92B1"
            maximumTrackTintColor="#B8CDD9"
            thumbTintColor="#5D92B1"
          />
          <Text style={styles.sliderMaxLabel}>High</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Stress Level:</Text>
        <Text style={styles.sliderValue}>{stressLevel}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMinLabel}>Low</Text>
          <CustomSlider
            minimumValue={1}
            maximumValue={5}
            value={stressLevel}
            onValueChange={setStressLevel}
            minimumTrackTintColor="#5D92B1"
            maximumTrackTintColor="#B8CDD9"
            thumbTintColor="#5D92B1"
          />
          <Text style={styles.sliderMaxLabel}>High</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Work Satisfaction:</Text>
        <Text style={styles.sliderValue}>{workSatisfaction}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMinLabel}>Low</Text>
          <CustomSlider
            minimumValue={1}
            maximumValue={5}
            value={workSatisfaction}
            onValueChange={setWorkSatisfaction}
            minimumTrackTintColor="#5D92B1"
            maximumTrackTintColor="#B8CDD9"
            thumbTintColor="#5D92B1"
          />
          <Text style={styles.sliderMaxLabel}>High</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Sleep Quality:</Text>
        <Text style={styles.sliderValue}>{sleepQuality}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMinLabel}>Poor</Text>
          <CustomSlider
            minimumValue={1}
            maximumValue={5}
            value={sleepQuality}
            onValueChange={setSleepQuality}
            minimumTrackTintColor="#5D92B1"
            maximumTrackTintColor="#B8CDD9"
            thumbTintColor="#5D92B1"
          />
          <Text style={styles.sliderMaxLabel}>Great</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Feeling Supported:</Text>
        <Text style={styles.sliderValue}>{supportFeeling}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMinLabel}>Not at all</Text>
          <CustomSlider
            minimumValue={1}
            maximumValue={5}
            value={supportFeeling}
            onValueChange={setSupportFeeling}
            minimumTrackTintColor="#5D92B1"
            maximumTrackTintColor="#B8CDD9"
            thumbTintColor="#5D92B1"
          />
          <Text style={styles.sliderMaxLabel}>Very</Text>
        </View>
      </View>
      
      <Text style={styles.inputLabel}>Additional Comments:</Text>
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Any specific challenges or victories today?"
        value={comments}
        onChangeText={setComments}
      />
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
      
      {assessments.length > 0 && (
        <TouchableOpacity 
          style={styles.viewResultsButton}
          onPress={() => setShowResults(true)}
        >
          <Text style={styles.viewResultsText}>View Past Results</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderAssessmentResults = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D92B1" />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      );
    }
    
    if (!assessments || assessments.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="sentiment-neutral" size={60} color="#B8CDD9" />
          <Text style={styles.emptyText}>No assessment data yet</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowResults(false)}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const latestData = assessments[0];
    const chartData = {
      labels: assessments.slice(0, 7).reverse().map(a => {
        const date = new Date(a.created_at);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: assessments.slice(0, 7).reverse().map(a => a.burnout_risk_score),
          color: (opacity = 1) => `rgba(93, 146, 177, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
    
    return (
      <ScrollView style={styles.resultsContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setShowResults(false)}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.resultsTitle}>Your Wellness Trends</Text>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Current Burnout Risk</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{latestData.burnout_risk_score}</Text>
            <Text style={styles.scoreScale}>/10</Text>
          </View>
          {trend && (
            <Text style={[
              styles.trendText, 
              trend.trend.direction === "increasing" ? styles.trendBad : 
              trend.trend.direction === "decreasing" ? styles.trendGood :
              styles.trendNeutral
            ]}>
              {trend.trend.direction === "increasing" ? "↑" : 
               trend.trend.direction === "decreasing" ? "↓" : "→"} 
              {trend.trend.direction === "insufficient data" ? "Insufficient data" :
               `${trend.trend.percentage_change}% ${trend.trend.direction}`}
            </Text>
          )}
        </View>
        
        {assessments.length > 1 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Burnout Risk Score (Last 7 Checks)</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(93, 146, 177, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#5D92B1"
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}
        
        {trend && (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Your Insights</Text>
            
            <View style={styles.insightCard}>
              <Icon name="wb-sunny" size={24} color="#F5A623" />
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Energy Levels</Text>
                <Text style={styles.insightText}>
                  Your average fatigue level is {trend.average_scores.fatigue_level}/5
                  {trend.average_scores.fatigue_level > 3 ? 
                    " - Try scheduling short breaks between patients" : 
                    " - Great job managing your energy!"}
                </Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <Icon name="night-shelter" size={24} color="#4A90E2" />
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Sleep Quality</Text>
                <Text style={styles.insightText}>
                  Your average sleep quality is {trend.average_scores.sleep_quality}/5
                  {trend.average_scores.sleep_quality < 3 ? 
                    " - Consider a screen-free wind-down routine" : 
                    " - Your sleep habits support your wellbeing"}
                </Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <Icon name="psychology" size={24} color="#7ED321" />
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Stress Management</Text>
                <Text style={styles.insightText}>
                  Your average stress level is {trend.average_scores.stress_level}/5
                  {trend.average_scores.stress_level > 3 ? 
                    " - Try a 2-minute breathing exercise between patients" : 
                    " - You're managing stress effectively"}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.newCheckButton}
          onPress={() => setShowResults(false)}
        >
          <Text style={styles.newCheckButtonText}>Take New Check</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {showResults ? renderAssessmentResults() : renderAssessmentForm()}

        {/* Bottom Navigation */}
        <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}  >
                <Image source={require('./assets/images/home_choose.png')} style={styles.navIcon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')} >
                <Image source={require('./assets/images/search.png')} style={styles.navIcon}  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
                <Image source={require('./assets/images/chat.png')} style={styles.navIcon}  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}  >
                <Image source={require('./assets/images/profile.png')} style={styles.navIcon} />
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
  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customSlider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 10,
  },
  sliderStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sliderValue: {
    position: 'absolute',
    right: 5,
    top: 0,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#666',
    width: 50,
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#666',
    width: 50,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5D92B1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewResultsButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#5D92B1',
  },
  viewResultsText: {
    color: '#5D92B1',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5D92B1',
  },
  backButtonText: {
    color: '#5D92B1',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 10,
    padding: 10,
    zIndex: 10,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5D92B1',
  },
  scoreScale: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  trendGood: {
    color: '#27AE60',
  },
  trendBad: {
    color: '#E74C3C',
  },
  trendNeutral: {
    color: '#F5A623',
  },
  chartContainer: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    marginTop: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightContent: {
    marginLeft: 15,
    flex: 1,
  },
  insightLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
    color: '#555',
  },
  newCheckButton: {
    backgroundColor: '#5D92B1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  newCheckButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});