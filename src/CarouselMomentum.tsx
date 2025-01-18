import React, { useRef, useState, useCallback, useMemo, useImperativeHandle, ForwardedRef } from 'react';
import { View, FlatList, Animated, ListRenderItem, FlatListProps } from 'react-native';
import { styles } from './style';

/**
 * CarouselProps defines the expected properties for the CarouselMomentum component.
 * - `data`: Array of items to display in the carousel.
 * - `sliderWidth`: The width of the carousel container.
 * - `itemWidth`: The width of each individual item in the carousel.
 * - `renderItem`: Function that renders each item in the carousel.
 * - `keyExtractor`: Function that provides a unique key for each item, defaulting to index if not provided.
 * - `onSnap`: Callback that is triggered when an item is snapped to the center of the carousel.
 * - `accessibilityLabelCarousel`: Optional accessibility label for the carousel.
 * - `onMomentumScrollStart`: Callback triggered when momentum scrolling starts.
 * - `onMomentumScrollEnd`: Callback triggered when momentum scrolling ends.
 */
interface CarouselProps<Item> {
  data: Item[];
  sliderWidth: number;
  itemWidth: number;
  renderItem: ListRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  onSnap: (index: number) => void;
  accessibilityLabelCarousel?: string;
  onMomentumScrollStart: () => void;
  onMomentumScrollEnd: () => void;
}

// Create an animated version of FlatList to support animations
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * CarouselMomentum component renders a horizontal scrollable carousel.
 * - It supports animated transitions and snap-to-item behavior.
 * - It uses `Animated.FlatList` to enable animation during scroll.
 */
const CarouselMomentum = <Item,>(
  {
    data,
    sliderWidth,
    itemWidth,
    renderItem,
    keyExtractor,
    onSnap,
    accessibilityLabelCarousel,
    onMomentumScrollStart,
    onMomentumScrollEnd
  }: CarouselProps<Item>,
  ref: ForwardedRef<FlatList<Item>>,
) => {
  // Reference to track the horizontal scroll position for animations
  const scrollX = useRef(new Animated.Value(0)).current;

  // State for storing the current index of the carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reference to the FlatList component for manual scroll control
  const flatListRef = useRef<FlatList<Item>>(null);

  // Expose imperative methods to the parent component via the `ref`
  useImperativeHandle(ref, () => ({
    getCurrentIndex: () => currentIndex, // Get the current index of the carousel
    goToIndex: (index) => goToIndex(index), // Method to scroll to a specific index
  }));

  /**
   * handleScroll is invoked during the scroll event to update the current index.
   * It also triggers the `onSnap` callback when the current index changes.
   */
  const handleScroll = useCallback<
    NonNullable<FlatListProps<Item>['onScroll']>
  >(
    e => {
      const offsetX = e.nativeEvent.contentOffset.x; // Get the horizontal scroll offset
      scrollX.setValue(offsetX); // Update the scroll position for animations
      const nextIndex = Math.round(offsetX / itemWidth); // Calculate the current index
      setCurrentIndex(nextIndex); // Update the state with the new index

      // If the index changes, call the onSnap callback
      if (nextIndex !== currentIndex) {
        onSnap(nextIndex);
      }
    },
    [
      currentIndex, // Dependency to ensure the effect updates when currentIndex changes
      data?.length, // Ensure this recalculates when data length changes
      itemWidth, // Recalculate if itemWidth changes
      onSnap, // Dependency on onSnap callback
      scrollX, // Dependency on scrollX for animated transitions
    ],
  );

  /**
   * Calculates the static offset of an item based on its index.
   * This is used when we want to programmatically scroll to a specific item.
   */
  const calculateItemOffsetStatic = (index: number) => index * itemWidth;

  /**
   * goToIndex scrolls to a specific index and updates the current index state.
   * It also triggers the snap-to-item callback (`onSnap`).
   */
  const goToIndex = useCallback((index: number) => {
    // Check if FlatList reference exists and current index is valid
    if (flatListRef.current && currentIndex < data.length - 1) {
      const offset = calculateItemOffsetStatic(index); // Calculate the offset for the given index
      flatListRef.current?.scrollToOffset({ animated: true, offset }); // Scroll to the desired offset
      setCurrentIndex(index); // Update the current index state
      onSnap(index); // Trigger the onSnap callback
    }
  }, [currentIndex, data.length, calculateItemOffsetStatic, onSnap]);

  /**
   * calculateCenteredItemOffset calculates the dynamic offset to center the item within the carousel.
   * This helps in applying animations to scale the item as it approaches the center of the viewport.
   */
  const calculateCenteredItemOffset = useCallback(
    (index: number) => {
      // Calculate the offset needed to center the item
      const centerOffset = (sliderWidth - itemWidth) / 2;
      return index * itemWidth - centerOffset;
    },
    [sliderWidth, itemWidth], // Recalculate if sliderWidth or itemWidth changes
  );

  /**
   * keyExtractorInternal extracts a unique key for each item, either using the provided `keyExtractor`
   * or falling back to the index if not provided.
   */
  const keyExtractorInternal = useCallback<
  NonNullable<FlatListProps<Item>['keyExtractor']>
  >(
    (item: Item, index: number) => keyExtractor ? keyExtractor(item, index) : index.toString(),
    [keyExtractor], // Recalculate if keyExtractor changes
  );

  /**
   * renderItemInternal renders each item in the carousel with an animated scale effect.
   * The scale is interpolated based on the scroll position (using scrollX) to give a zooming effect
   * as items approach or leave the center of the viewport.
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
                    calculateCenteredItemOffset(index - 1), // Left item
                    calculateCenteredItemOffset(index),     // Current item
                    calculateCenteredItemOffset(index + 1), // Right item
                  ],
                  outputRange: [0.8, 1, 0.8], // Scale items to 0.8 when off-center and 1 when centered
                  extrapolate: 'clamp', // Clamp the scale to avoid values beyond the range
                }),
              },
            ],
          },
        ]}
      >
        {renderItem({ item, index })} {/* Render the individual item using the provided renderItem prop */}
      </Animated.View>
    ),
    [calculateCenteredItemOffset, itemWidth, renderItem, scrollX], // Recalculate when these values change
  );

  return (
    <View style={[styles.container, { width: sliderWidth }]} accessibilityLabel={accessibilityLabelCarousel}>
      {/* The main AnimatedFlatList that renders the carousel */}
      <AnimatedFlatList
        ref={flatListRef} // Reference to FlatList for direct manipulation
        data={data} // The data to display in the carousel
        keyExtractor={keyExtractor ?? keyExtractorInternal} // Use the provided or internal keyExtractor
        horizontal // Display items horizontally
        showsHorizontalScrollIndicator={false} // Hide the scroll indicator
        snapToInterval={itemWidth} // Snapping behavior after each item
        decelerationRate="fast" // Fast deceleration for smooth scrolling
        bounces={false} // Disable the bounce effect on scroll edges
        onScroll={handleScroll} // Handle scroll events
        scrollEventThrottle={16} // Throttle scroll event updates for smoother performance
        onMomentumScrollEnd={onMomentumScrollEnd} // Callback triggered when momentum scroll ends
        onMomentumScrollStart={onMomentumScrollStart} // Callback triggered when momentum scroll starts
        renderItem={renderItemInternal} // Render each item with animation
        contentContainerStyle={{
          paddingHorizontal: (sliderWidth - itemWidth) / 2, // Center the items within the container
        }}
      />
    </View>
  );
};

// Forward ref to the CarouselMomentum component to expose imperative methods to the parent
const WithForwardedRef = React.forwardRef(CarouselMomentum);

// Wrap the component with React.memo for performance optimization (prevents unnecessary re-renders)
const Memoized = React.memo(WithForwardedRef);

export default Memoized; // Export the memoized component
