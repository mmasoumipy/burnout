import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

export default function HomeSetTime({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('Set Your Time');
    const [selectedTime, setSelectedTime] = useState('5 min'); // Default tab

    const [selectedMood, setSelectedMood] = useState(null);

    const moods = [
        { id: 'frustrated', label: 'Frustrated', image: require('./assets/frustrated.png') },
        { id: 'sad', label: 'Sad', image: require('./assets/downcast.png') },
        { id: 'calm', label: 'Calm', image: require('./assets/calm.png') },
        { id: 'happy', label: 'Happy', image: require('./assets/happy.png') },
        { id: 'excited', label: 'Excited', image: require('./assets/excited.png') },
    ];

    const handleMoodClick = (mood) => {
        setSelectedMood(mood.id);
        alert(`You selected: ${mood.label}`);
    };

    const courses = [
        { title: 'Morning Course 1', subtitle: 'Video/ Text/ Audio Time', image: require('./assets/morning1.png') },
        { title: 'Morning Course 2', subtitle: 'Video/ Text/ Audio Time', image: require('./assets/morning2.png') },
        { title: 'Morning Course 3', subtitle: 'Video/ Text/ Audio Time', image: require('./assets/morning3.png') },
        { title: 'Afternoon Course', subtitle: 'Video/ Text/ Audio Time', image: require('./assets/afternoon.png') },
        { title: 'Night Course', subtitle: 'Video/ Text/ Audio Time', image: require('./assets/night.png') },
    ];

    const handleCourseClick = (course) => {
        alert(`You clicked on ${course.title}`);
    };

    const times = ['5 min', '10 min', '15 min', '20 min', '25 min', '+30 min'];

    const handleTimeSelect = (time) => {
        setSelectedTime(time); 
        alert(`You selected: ${time}`); 
    };


    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView>
                    <Text style={styles.title}>Set Your Time</Text>

                    {/* Emotions Row */}
                    <Text style={styles.subtitle}>How do you feel today?</Text>
                    <View style={styles.moodContainer}>
                        {moods.map((mood) => (
                            <TouchableOpacity
                            key={mood.id}
                            style={[
                                styles.moodButton,
                                selectedMood === mood.id && styles.selectedMood, // Highlight selected mood
                            ]}
                            onPress={() => handleMoodClick(mood)} // Handle mood selection
                            >
                            <Image source={mood.image} style={styles.moodImage} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'Your Plan' && styles.activeTab]}
                            onPress={() => navigation.navigate('HomePlan')
                            }
                        >
                            <Text style={styles.tabText}>Your plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'Set Your Time' && styles.activeTab]}
                            onPress={() => setSelectedTab('Set Your Time')
                            }
                        >
                            <Text style={styles.tabText}>Set your time</Text>
                        </TouchableOpacity>
                    </View>
        
                {/* Time Options */}
                <ScrollView
                    horizontal={true} // Enable horizontal scrolling
                    showsHorizontalScrollIndicator={true} // Show scroll indicator for clarity
                    contentContainerStyle={styles.timeContainer} // Apply container styles
                    >
                    {times.map((time, index) => (
                        <TouchableOpacity
                        key={index}
                        style={[
                            styles.timeButton,
                            selectedTime === time && styles.selectedTime, // Highlight selected time
                        ]}
                        onPress={() => handleTimeSelect(time)}
                        >
                        <Text style={styles.timeText}>{time}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
        
                {/* Courses */}
                <Text style={styles.sectionTitle}>Courses</Text>
                <View style={styles.courseCard}>
                <Text style={styles.courseTitle}>Course name</Text>
                <Text style={styles.courseDescription}>
                    short explanation video/Text/Audio Time (max 5min)
                </Text>
                </View>
                <View style={styles.courseCard}>
                <Text style={styles.courseTitle}>Course name</Text>
                <Text style={styles.courseDescription}>
                    short explanation video/Text/Audio Time (max 5min)
                </Text>
                </View>
                <View style={styles.courseCard}>
                <Text style={styles.courseTitle}>Course name</Text>
                <Text style={styles.courseDescription}>
                    short explanation video/Text/Audio Time (max 5min)
                </Text>
                </View>
            </ScrollView>
            </View>


            {/* Bottom Navigation */}
            <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}  >
                <Image source={require('./assets/home_choose.png')} style={styles.navIcon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')} >
                <Image source={require('./assets/search.png')} style={styles.navIcon}  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
                <Image source={require('./assets/chat.png')} style={styles.navIcon}  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}  >
                <Image source={require('./assets/profile.png')} style={styles.navIcon} />
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
        content: {
            flex: 1,
            padding: 24,
            marginTop: 32,
            justifyContent: 'center', 
            backgroundColor: '#FAF9F6',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            margin: 20,
          },
        subtitle: { 
            fontSize: 16, 
            marginHorizontal: 20, 
            marginBottom: 20, 
            color: '#666' 
        },
        moodContainer: {
            flexDirection: 'row',
            justifyContent: 'space-evenly', 
            marginVertical: 20,
            marginTop: 8,
          },
        moodButton: {
            marginHorizontal: 5,
            width: '15%', // Set size relative to the screen width
            aspectRatio: 1, // Ensures the button is a perfect square
            borderRadius: 50, // Half of the width for circular buttons
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#B8CDD9',
        },
        selectedMood: {
            backgroundColor: '#5D92B1', 
        },
        moodImage: {
            width: 40,
            height: 40,
        },
        buttons: { 
            flexDirection: 'row', 
            justifyContent: 'left', 
            marginBottom: 8,
            marginTop: 24,
        },
        tabButton: { 
            padding: 10, 
            marginHorizontal: 10, 
            borderRadius: 20, 
            backgroundColor: '#B8CDD9', 
        },
        activeTab: { 
            backgroundColor: '#5D92B1', 
        },
        tabText: { 
            fontSize: 16, 
            color: '#000' 
        },
        timeContainer: {
          flexDirection: 'row',
          marginVertical: 20,
        },
        timeButton: {
          padding: 10,
          borderRadius: 20,
          backgroundColor: '#B3CBD9',
          marginHorizontal: 5,
        },
        selectedTime: {
          backgroundColor: '#5D92B1',
        },
        timeText: {
          fontSize: 16,
          color: '#66',
        },
        sectionTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          margin: 20,
        },
        courseCard: {
          flexDirection: 'column',
          padding: 15,
          margin: 10,
          borderRadius: 10,
          backgroundColor: '#B0C4DE',
        },
        courseTitle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        courseDescription: {
          fontSize: 14,
          color: '#666',
          marginTop: 5,
        },
        navbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#E0E0E0' },
        navItem: { padding: 10 },
        navIcon: { width: 30, height: 30 },
    });