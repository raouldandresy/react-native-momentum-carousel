import React, { useRef, useState, useCallback, useMemo, useImperativeHandle, ForwardedRef } from 'react';
import { View, FlatList, Animated, ListRenderItem } from 'react-native';
import { styles } from './style';

interface CarouselProps<Item> {
  data: Item[];
  sliderWidth: number;
  itemWidth: number;
  renderItem: ListRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  onSnapToItem: (index: number) => void;
  accessibilityLabelCarousel?: string;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * CarouselMomentum component that renders a horizontal scrollable carousel.
 * It supports animated transitions and snap-to-item behavior.
 */
const CarouselMomentum = <Item,>(
  {
    data,
    sliderWidth,
    itemWidth,
    renderItem,
    keyExtractor,
    onSnapToItem,
    accessibilityLabelCarousel,
  }: CarouselProps<Item>,
  ref: ForwardedRef<FlatList<Item>>,
) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Item>>(null);

  useImperativeHandle(ref, () => ({
    getCurrentIndex: () => currentIndex,
    goToIndex: (index) => goToIndex(index),
  }));

  /**
   * Handles the scrolling event to update the current index.
   */
  const handleScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true }),
    [scrollX],
  );

  /**
   * Updates the current index when the scroll momentum ends.
   * It also triggers the callback to notify the parent component of the snap-to-item event.
   */
  const onMomentumScrollEnd = useCallback(
    (e) => {
      const offset = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offset / itemWidth);
      setCurrentIndex(newIndex);
      if (newIndex !== currentIndex) {
        onSnapToItem(newIndex);
      }
    },
    [currentIndex, itemWidth, onSnapToItem],
  );

  /**
   * Calculates the static offset of an item based on its index.
   */
  const calculateItemOffsetStatic = (index: number) => index * itemWidth;

  /**
   * Scrolls to a specific index and updates the current index state.
   * It also triggers the snap-to-item callback.
   */
  const goToIndex = useCallback((index: number) => {
    if (flatListRef.current && currentIndex < data.length - 1) {
      const offset = calculateItemOffsetStatic(index);
      flatListRef.current?.scrollToOffset({ animated: true, offset });
      setCurrentIndex(index);
      onSnapToItem(index);
    }
  }, [currentIndex, data.length, calculateItemOffsetStatic, onSnapToItem]);

  /**
   * Calculates the dynamic offset to center the item within the slider.
   */
  const calculateCenteredItemOffset = useCallback(
    (index: number) => {
      const centerOffset = (sliderWidth - itemWidth) / 2;
      return index * itemWidth - centerOffset;
    },
    [sliderWidth, itemWidth],
  );

  /**
   * Extracts the unique key for each item, either using the provided keyExtractor or falling back to the index.
   */
  const keyExtractorInternal = useCallback(
    (item: Item, index: number) => keyExtractor ? keyExtractor(item, index) : index.toString(),
    [keyExtractor],
  );

  /**
   * Renders each item in the carousel with an animated scale effect based on scroll position.
   */
  const renderItemInternal = useCallback(
    ({ item, index }: { item: Item; index: number }) => (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            width: itemWidth,
            transform: [
              {
                scale: scrollX.interpolate({
                  inputRange: [
                    calculateCenteredItemOffset(index - 1),
                    calculateCenteredItemOffset(index),
                    calculateCenteredItemOffset(index + 1),
                  ],
                  outputRange: [0.8, 1, 0.8],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        {renderItem({ item, index })}
      </Animated.View>
    ),
    [calculateCenteredItemOffset, itemWidth, renderItem, scrollX],
  );

  return (
    <View style={[styles.container, { width: sliderWidth }]} accessibilityLabel={accessibilityLabelCarousel}>
      <AnimatedFlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor ?? keyExtractorInternal}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderItemInternal}
        contentContainerStyle={{
          paddingHorizontal: (sliderWidth - itemWidth) / 2,
        }}
      />
    </View>
  );
};

const WithForwardedRef = React.forwardRef(CarouselMomentum);
const Memoized = React.memo(WithForwardedRef);

export default Memoized;