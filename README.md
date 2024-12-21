# React Native Momentum Carousel

A performant and easy-to-use carousel component for React Native. This carousel leverages momentum scrolling for a smooth user experience.

## Installation

To install the package, use npm or yarn:

### Using npm:

npm install react-native-momentum-carousel

## Usage

To use the carousel in your React Native project, simply import it and pass in the necessary props. Here's a basic example:

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MomentumCarousel from 'react-native-momentum-carousel';

const App = () => {
  return (
    <View style={styles.container}>
      <MomentumCarousel
        style={styles.carousel}
        items={[
          { key: '1', content: 'Item 1' },
          { key: '2', content: 'Item 2' },
          { key: '3', content: 'Item 3' },
        ]}
        renderItem={(item) => (
          <View style={styles.item}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    width: '90%',
    height: 200,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: 'lightgrey',
    margin: 5,
  },
});

export default App;


## Props

### `items` (Array)
An array of objects representing the items to display in the carousel. Each item must have a unique `key` and the content to be displayed.

### `renderItem` (Function)
A function to render the item. It receives an item object and should return a React Native component to display.

### `style` (Object)
An optional style prop to customize the carousel's container.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions to this project! If you'd like to contribute, please fork the repository and submit a pull request with your changes.

## Issues

If you encounter any bugs or have suggestions for improvements, feel free to open an issue in the [Issues](https://github.com/raouldandresy/react-native-momentum-carousel/issues) section of the repository.

## Acknowledgments

This project is built on the idea of creating a simple yet performant carousel with momentum scrolling. Special thanks to the React Native community for all the contributions that make building apps easier!
