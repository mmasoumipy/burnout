import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const questions = [
  {
    category: 'Emotional Exhaustion (EE)',
    items: [
      'I feel emotionally drained from my work.',
      'I feel used up at the end of the workday.',
      'I feel fatigued when I get up in the morning and have to face another day on the job.',
      'I can easily understand how my recipients feel about things.',
    ],
  },
  {
    category: 'Depersonalization (DP)',
    items: [
      'I feel I treat some recipients as if they were impersonal objects.',
      'Working with people all day is really a strain for me.',
      'I deal very effectively with the problems of my recipients.',
    ],
  },
  {
    category: 'Denationalization (DN)',
    items: [
      'I feel burned out from my work.',
      "I feel I'm positively influencing other people's lives through my work.",
      "I've become more callous toward people since I took this job.",
    ],
  },
];

const options = [
  'Never',
  'A few times a year',
  'Once a month or less',
  'A few times a month',
  'Once a week',
  'A few times a week',
  'Every day',
];

export default function TakeTest({ navigation }) {
  const [responses, setResponses] = useState({}); // Tracks user responses

  const handleSelect = (questionIndex, optionIndex) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  return (
    <View style={styles.container}>
        <ScrollView style={styles.content}>
        {questions.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
            <Text style={styles.category}>{section.category}</Text>
            {section.items.map((question, questionIndex) => {
                const globalIndex = `${sectionIndex}-${questionIndex}`; // Unique key
                return (
                <View key={globalIndex} style={styles.questionContainer}>
                    <Text style={styles.question}>{question}</Text>
                    {options.map((option, optionIndex) => (
                    <TouchableOpacity
                        key={optionIndex}
                        style={styles.optionContainer}
                        onPress={() => handleSelect(globalIndex, optionIndex)}
                    >
                        <View
                        style={[
                            styles.radioButton,
                            responses[globalIndex] === optionIndex && styles.selectedRadio,
                        ]}
                        />
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
                );
            })}
            </View>
        ))}
        <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        </ScrollView>


        {/* Bottom Navigation */}
        <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}>
            <Image source={require('./assets/home.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
            <Image source={require('./assets/search.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
            <Image source={require('./assets/chat.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <Image source={require('./assets/profile_choose.png')} style={styles.navIcon} />
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
        backgroundColor: '#FAF9F6',
    },
    section: {
        marginBottom: 20,
    },
    category: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    questionContainer: {
        backgroundColor: '#5D92B1',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        marginRight: 10,
    },
    selectedRadio: {
        backgroundColor: '#F5A623',
    },
    optionText: {
        fontSize: 14,
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    submitText: {
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
