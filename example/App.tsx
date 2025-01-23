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
  Text, TextInput, TextInputProps,
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(3);

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

  const handleAutoplayIntervalChange = useCallback<NonNullable<TextInputProps['onChangeText']>>((value) => {
    const possibleValue = Number(value);
    if (Number.isNaN(possibleValue)) {
      return;
    }

    setAutoplayInterval(possibleValue ?? 1);
  }, []);

  const renderItem = ({ item, index }) => {
    return (
    <Pressable style={styles.itemContainer} onPress={() => goToIndex(index)}>
      <Image source={{ uri: item.source }} style={styles.image}/>
    </Pressable>
    );
  };
  const flatListRef = useRef(CarouselMomentum);

  const goToIndex = (index: number) => {
    console.log(flatListRef?.current?.getCurrentIndex());
    flatListRef?.current?.goToIndex(index);
  };
  const onSnap = (index: number) => {
    setCurrentIndex(index);
  };

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
            autoPlayInterval={autoplayInterval * 1000}
            renderItem={renderItem}
            onSnap={onSnap}
            keyExtractor={(item)=> item.id}
            inactiveScale={0.8}
            showPagination
            paginationStyle={{activeBullet:{}, bullet:{}, container:{}}}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button title={'Toggle autoplay'} onPress={handleToggleAutoplayPress} />
          <View style={styles.separator} />
          <Button title={'Toggle loop'} onPress={handleToggleLoopPress} />
          <View style={styles.separator} />
          <Text>Set an autoplay interval in seconds</Text>
          <TextInput style={styles.autoplayIntervalInput} value={String(autoplayInterval)} placeholder={'Set autoplay interval'} onChangeText={handleAutoplayIntervalChange} />
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
    alignItems: 'center',
  },
  separator: {
    marginBottom: 10,
  },
  autoplayIntervalInput: {
    width: 200,
    padding: 10,
    borderBottomWidth: 1,
  },
});

export default App;
