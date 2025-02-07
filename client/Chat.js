import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';

export default function Chat({ navigation }) {
    const [activeTab, setActiveTab] = useState('Chatbot'); // Default tab is 'Chatbot'

    // Dummy data for journal entries
    const journalEntries = [
        { id: '1', title: 'Title', date: 'Date' },
        { id: '2', title: 'Title', date: 'Date' },
        { id: '3', title: 'Another Title', date: 'Another Date' },
    ];

    const handleAddJournal = () => {
        Alert.alert(
          'Add New Journal Entry',
          'This will open a form to add a new journal entry.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]
        );
      };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'Chatbot' && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab('Chatbot')}
                    >
                    <Text style={[styles.tabText, activeTab === 'Chatbot' && styles.activeTabText]}>
                        chatbot-name
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'Journal' && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab('Journal')}
                    >
                    <Text style={[styles.tabText, activeTab === 'Journal' && styles.activeTabText]}>
                        journal
                    </Text>
                    </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={styles.bodyContent}>
                    {activeTab === 'Chatbot' ? (
                    // Chatbot Section Placeholder
                    <View style={styles.chatbotContainer}>
                        <View style={styles.chatbotBubble}></View>
                        <View style={styles.chatbotBubble}></View>
                    </View>
                    ) : (
                    // Journal Section with FlatList
                    <FlatList
                        data={journalEntries}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                        <View style={styles.journalEntry}>
                            <Text style={styles.journalTitle}>{item.title}</Text>
                            <Text style={styles.journalDate}>{item.date}</Text>
                        </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }} // Add space for floating button
                    />
                    )}
                </View>

                {/* Add Button for Journal */}
                {activeTab === 'Journal' && (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddJournal}>
                    <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}

            </View>



            {/* Bottom Navigation */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}>
                <Image source={require('./assets/images/home.png')} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
                <Image source={require('./assets/images/search.png')} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
                <Image source={require('./assets/images/chat_choose.png')} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                <Image source={require('./assets/images/profile.png')} style={styles.navIcon} />
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
        padding: 24,
        marginTop: 32,
        justifyContent: 'center',
        backgroundColor: '#FAF9F6',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#B8CDD9',
    },
    activeTabButton: {
        backgroundColor: '#5D92B1',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    bodyContent: {
        flex: 1,
        padding: 20,
    },
    chatbotContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    chatbotBubble: {
        width: '80%',
        height: 50,
        backgroundColor: '#DCE9F9',
        borderRadius: 10,
        marginVertical: 10,
    },
    journalEntry: {
        backgroundColor: '#DFF9DC',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    journalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    journalDate: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#A5F5CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 32,
        color: '#FFF',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#E0E0E0',
    },
    navItem: { padding: 10 },
    navIcon: { width: 30, height: 30 },
});

