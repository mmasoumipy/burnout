import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

export default function Explore({ navigation }) {
  const [selectedTime, setSelectedTime] = useState('');

  const times = [
    { label: '5 min', value: '5 min' },
    { label: '10 min', value: '10 min' },
    { label: '15 min', value: '15 min' },
    { label: '20 min', value: '20 min' },
    { label: '25 min', value: '25 min' },
    { label: '+30 min', value: '+30 min' },
  ];

  const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4'];
  const categoryColors = ['#DCE9F9', '#CFF9D9', '#F9ECD7', '#FAD4D8'];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView>
          {/* Time Selection */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>For </Text>
            <RNPickerSelect
                onValueChange={(value) => setSelectedTime(value)}
                items={times}
                value={selectedTime} // Set the current value
                useNativeAndroidPickerStyle={false} // Use a custom style on Android
                placeholder={{ label: 'Select a time...', value: null }} // Placeholder text
                style={{
                    inputAndroid: styles.dropdownInput,
                    inputIOS: styles.dropdownInput,
                    iconContainer: styles.dropdownIcon, // Dropdown arrow positioning
                }}
            />
            <Text style={styles.headerText}>, I want to ...</Text>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryButton, { backgroundColor: categoryColors[index] }]}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image-Based Sections */}
          <TouchableOpacity style={styles.imageSection}>
            <ImageBackground
              source={require('./assets/cat_season.png')} 
              style={styles.imageBackground}
              imageStyle={{ borderRadius: 15 }}
            >
              <Text style={styles.imageText}>Another category (ex. Season)</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageSection}>
            <ImageBackground
              source={require('./assets/cat_audio.png')}
              style={styles.imageBackground}
              imageStyle={{ borderRadius: 15 }} 
            >
              <Text style={styles.imageText}>Best Audios</Text>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}>
          <Image source={require('./assets/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('./assets/search_choose.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
          <Image source={require('./assets/chat.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('./assets/profile.png')} style={styles.navIcon} />
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textDecorationLine: 'underline',
    padding: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  categoryButton: {
    width: '40%',
    aspectRatio: 2, // Maintain a 2:1 aspect ratio
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  imageSection: {
    marginVertical: 15,
  },
  imageBackground: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a transparent background for better readability
    paddingHorizontal: 10,
    borderRadius: 5,
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
