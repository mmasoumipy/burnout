import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';

export default function Reason() {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    'Reason 1/ Reason 1/ Reason 1/ Reason 1',
    'Reason 2/ Reason 2/ Reason 2/ Reason 2',
    'Reason 3/ Reason 3/ Reason 3/ Reason 3',
    'Reason 4/ Reason 4/ Reason 4/ Reason 4',
    'Reason 5/ Reason 5/ Reason 5/ Reason 5',
  ];

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const renderOption = ({ item }) => {
    const isSelected = selectedOptions.includes(item);
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => toggleOption(item)}
      >
        <Text style={styles.optionText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo_half.png')} style={styles.backgroundImage} />

      {/* Content View */}
      <View style={styles.content}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>(multiple can be selected)</Text>

        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />

        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.2,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: 32,
    justifyContent: 'center', 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
  option: {
    backgroundColor: '#B0C4DE',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
  },
  optionSelected: {
    backgroundColor: '#4682B4',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
