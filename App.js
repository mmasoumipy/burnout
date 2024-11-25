import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput style={styles.textInput} value='Text' />
        <Button title='Tap me!'/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',

  },

  textInput: {
    flex: '70%',
    borderWidth: 1,
    // margin: 50,
    padding: 16,
  },
});
