/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useRef, useState} from 'react';
import {
  Button,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { CarouselMomentum } from 'react-native-momentum-carousel';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

const windowWidth = Dimensions.get('window').width;
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [index, setIndex] = useState(0);

  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);

  const images = [
    { id: '1', source: 'https://picsum.photos/411/250/' },
    { id: '2', source: 'https://picsum.photos/411/250/' },
    { id: '3', source: 'https://picsum.photos/411/250/' },
    { id: '4', source: 'https://picsum.photos/411/250/' },
    { id: '5', source: 'https://picsum.photos/411/250/' },
  ];

  const handleToggleAutoplayPress = useCallback(() => {
    setAutoplay((current) => !current);
  }, []);

  const handleToggleLoopPress = useCallback(() => {
    setLoop((current) => !current);
  }, []);

  const renderItem = ({ item, index }) => {
    return (
    <Pressable style={styles.itemContainer} onPress={() => goToIndex(index)}>
      <Image source={{ uri: item.source }} style={styles.image}/>
    </Pressable>
    );
  };
  const flatListRef = useRef(CarouselMomentum);

  const goToIndex = (index) => {
    console.log(flatListRef?.current?.getCurrentIndex());
    flatListRef?.current?.goToIndex(index);
  };
  const onSnap = (index) => {
    setIndex(index);};

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View style={styles.header}>
        <Text>{`Autoplay: ${autoplay ? 'true' : 'false'}`}</Text>
        <Text>{`Looping: ${loop ? 'true' : 'false'}`}</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <CarouselMomentum
            ref={flatListRef}
            data={images}
            sliderWidth={windowWidth}
            itemWidth={windowWidth * 0.8}
            autoPlay={autoplay}
            loop={loop}
            renderItem={renderItem}
            onSnap={onSnap}
            keyExtractor={(item)=> item.id}
            inactiveScale={0.8}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button title={'Toggle autoplay'} onPress={handleToggleAutoplayPress} />
          <Button title={'Toggle loop'} onPress={handleToggleLoopPress} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: windowWidth * 0.8,
    height: 250,  // Altezza delle immagini
  },
  buttonsContainer: {
    marginTop: 20,
  },
});

export default App;
