import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

export default function Home({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('Your Plan'); // Default tab

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
        // Navigate to course details if required
    };

    return (
        <View style={styles.container}>
        <View style={styles.content}>
        <ScrollView>
            <Text style={styles.greeting}>Good morning, Mina</Text>
            <Text style={styles.subtitle}>How do you feel today?</Text>

            {/* Emotions Row */}
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
                onPress={() => setSelectedTab('Your Plan')}
            >
                <Text style={styles.tabText}>Your plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'Set Your Time' && styles.activeTab]}
                onPress={() => setSelectedTab('Set Your Time')}
            >
                <Text style={styles.tabText}>Set your time</Text>
            </TouchableOpacity>
            </View>

            {/* Courses */}
            <Text style={styles.sectionTitle}>Start Fresh</Text>
            {courses.slice(0, 3).map((course, index) => (
            <TouchableOpacity
                key={index}
                style={styles.courseCard}
                onPress={() => handleCourseClick(course)}
            >
                <View style={styles.courseTextContainer}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseSubtitle}>{course.subtitle}</Text>
                </View>
                <Image source={course.image} style={styles.courseImage} />
            </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Midday Boost</Text>
            <TouchableOpacity style={styles.courseCard} onPress={() => handleCourseClick(courses[3])}>
                <View style={styles.courseTextContainer}>
                    <Text style={styles.courseTitle}>{courses[3].title}</Text>
                    <Text style={styles.courseSubtitle}>{courses[3].subtitle}</Text>
                </View>
                <Image source={courses[3].image} style={styles.courseImage} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Night's Calm</Text>
            <TouchableOpacity style={styles.courseCard} onPress={() => handleCourseClick(courses[4])}>
                <View style={styles.courseTextContainer}>
                    <Text style={styles.courseTitle}>{courses[4].title}</Text>
                    <Text style={styles.courseSubtitle}>{courses[4].subtitle}</Text>
                </View>
                <Image source={courses[4].image} style={styles.courseImage} />
            </TouchableOpacity>
        </ScrollView>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem}>
            <Image source={require('./assets/home_choose.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
            <Image source={require('./assets/search.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
            <Image source={require('./assets/chat.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
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
    greeting: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        margin: 24,
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
        backgroundColor: '#E0E0E0',
    },
    selectedMood: {
        backgroundColor: '#007AFF', // Highlight selected mood
    },
    moodImage: {
        width: 40,
        height: 40,
    },
    subtitle: { 
        fontSize: 16, 
        marginHorizontal: 20, 
        marginBottom: 20, 
        color: '#666' 
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
        backgroundColor: '#E0E0E0' 
    },
    activeTab: { 
        backgroundColor: '#007AFF' 
    },
    tabText: { 
        fontSize: 16, color: '#FFFFFF' 
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginTop: 24,
        marginBottom: 8,
    },
    courseCard: { 
        flexDirection: 'row', 
        padding: 15, 
        margin: 10, 
        borderRadius: 10, 
        backgroundColor: '#B0C4DE',
    },
    courseTextContainer: {
        flex: 1,
        flexDirection: 'column', 
        marginLeft: 10, 
      },
    courseTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        flex: 1, 
    },
    courseSubtitle: { 
        fontSize: 14, 
        color: '#666', 
        flex: 1 
    },
    courseImage: { width: 50, height: 50 },
    navbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#E0E0E0' },
    navItem: { padding: 10 },
    navIcon: { width: 30, height: 30 },
});
