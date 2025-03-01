/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  TextInput,
  TextInputProps,
  useColorScheme,
  ListRenderItemInfo,
  View,
  ListRenderItem,
  AccessibilityInfo,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import {
  CarouselMomentum,
  CarouselMomentumAnimationType,
  CarouselRef,
} from 'react-native-momentum-carousel';

const windowWidth = Dimensions.get('window').width;

function App(): React.JSX.Element {
  const flatListRef = useRef<CarouselRef>(null);

  const isDarkMode = useColorScheme() === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(3);

  const images = useMemo(
    () => [
      { id: '1', source: 'https://picsum.photos/411/250/' },
      { id: '2', source: 'https://picsum.photos/411/250/' },
      { id: '3', source: 'https://picsum.photos/411/250/' },
      { id: '4', source: 'https://picsum.photos/411/250/' },
      { id: '5', source: 'https://picsum.photos/411/250/' },
    ],
    []
  );

  const accessibilityData = useMemo(() => {
    return [
      { name: 'John', surname: 'Doe', age: 30 },
      { name: 'Jane', surname: 'Smith', age: 25 },
      { name: 'Michael', surname: 'Johnson', age: 28 },
      { name: 'Emily', surname: 'Johnson', age: 28 },
      { name: 'David', surname: 'Williams', age: 32 },
      { name: 'Sarah', surname: 'Brown', age: 27 },
      { name: 'James', surname: 'Jones', age: 35 },
      { name: 'Maria', surname: 'Garcia', age: 29 },
    ];
  }, []);

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }),
    [isDarkMode]
  );

  const handleToggleAutoplayPress = useCallback(() => {
    setAutoplay((current) => !current);
  }, []);

  const handleToggleLoopPress = useCallback(() => {
    setLoop((current) => !current);
  }, []);

  const handleAutoplayIntervalChange = useCallback<
    NonNullable<TextInputProps['onChangeText']>
  >((value) => {
    const possibleValue = Number(value);
    if (Number.isNaN(possibleValue)) {
      return;
    }

    setAutoplayInterval(possibleValue ?? 1);
  }, []);

  const goToIndex = useCallback((_index: number) => {
    console.log(flatListRef?.current?.getCurrentIndex());
    flatListRef?.current?.goToIndex(_index);
  }, []);

  const onSnap = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const keyExtractor = useCallback((item: (typeof images)[number]) => {
    return item.id;
  }, []);

  const handleAccessibilityItemSnap = useCallback((index: number) => {
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(`Item ${index} snapped`);
    }, 1000);
  }, []);

  const renderItem = useCallback(
    ({ item, index: _index }: ListRenderItemInfo<(typeof images)[number]>) => {
      return (
        <Pressable
          style={styles.itemContainer}
          onPress={() => goToIndex(_index)}
        >
          <Image source={{ uri: item.source }} style={styles.image} />
        </Pressable>
      );
    },
    [goToIndex]
  );

  const renderAccessibilityItem = useCallback<
    ListRenderItem<(typeof accessibilityData)[number]>
  >(({ item }) => {
    return (
      <View accessible style={styles.accessibilityItemContainer}>
        <View>
          <Text
            accessible={false}
            accessibilityLabel={`My name is ${item.name}`}
          >
            {item.name}
          </Text>
          <Text
            accessible={false}
            accessibilityLabel={`My surname is ${item.surname}`}
          >
            {item.surname}
          </Text>
          <Text accessible={false} accessibilityLabel={`My age is ${item.age}`}>
            {item.age}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View style={styles.header}>
        <Text>{`Current index: ${currentIndex}`}</Text>
        <Text>{`Autoplay: ${autoplay ? 'true' : 'false'}`}</Text>
        <Text>{`Looping: ${loop ? 'true' : 'false'}`}</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <CarouselMomentum
            ref={flatListRef}
            data={images}
            sliderWidth={windowWidth}
            itemWidth={windowWidth}
            autoPlay={autoplay}
            loop={loop}
            autoPlayInterval={autoplayInterval * 1000}
            renderItem={renderItem}
            onSnap={onSnap}
            keyExtractor={keyExtractor}
            inactiveScale={0.8}
            showPagination
            paginationStyle={{ activeBullet: {}, bullet: {}, container: {} }}
            animation={CarouselMomentumAnimationType.Stack}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            title={'Toggle autoplay'}
            onPress={handleToggleAutoplayPress}
          />
          <View style={styles.separator} />
          <Button title={'Toggle loop'} onPress={handleToggleLoopPress} />
          <View style={styles.separator} />
          <Text>Set an autoplay interval in seconds</Text>
          <TextInput
            style={styles.autoplayIntervalInput}
            value={String(autoplayInterval)}
            placeholder={'Set autoplay interval'}
            onChangeText={handleAutoplayIntervalChange}
          />
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
    height: 250, // Altezza delle immagini
  },
  buttonsContainer: {
    marginVertical: 20,
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
  accessibilityContainer: {},
  accessibilityTitle: {
    alignItems: 'center',
  },
  accessibilityItemContainer: {
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
});

export default App;
