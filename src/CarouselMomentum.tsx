import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  ForwardedRef,
  useEffect,
} from 'react';
import {
  View,
  FlatList,
  Animated,
  ListRenderItem,
  FlatListProps,
} from 'react-native';
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
 * - `onMomentumScrollStart`: Optional Callback triggered when momentum scrolling starts.
 * - `onMomentumScrollEnd`: Optional Callback triggered when momentum scrolling ends.
 * - `autoPlay`: Optional boolean to enable automatic scrolling through the carousel.
 * - `loop`: Optional boolean to loop the carousel back to the start after reaching the last item.
 * - `autoPlayInterval`: Optional number for automatic scrolling through the carousel.
 * - `inactiveScale`: Optional number for scale inactive items
 */
interface CarouselProps<Item> {
  data: Item[];
  sliderWidth: number;
  itemWidth: number;
  renderItem: ListRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  onSnap: (index: number) => void;
  accessibilityLabelCarousel?: string;
  onMomentumScrollStart?: () => void;
  onMomentumScrollEnd?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  autoPlayInterval?: number;
  inactiveScale?: number;
}

interface CarouselRef<Item> {
  getCurrentIndex: () => number; // Method to get the current index of the carousel
  goToIndex: (index: number) => void; // Method to scroll to a specific index
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
    onMomentumScrollEnd,
    autoPlay,
    loop,
    autoPlayInterval,
    inactiveScale,
  }: CarouselProps<Item>,
  ref: ForwardedRef<CarouselRef<Item>>
) => {
  // Reference to track the horizontal scroll position for animations
  const scrollX = useRef(new Animated.Value(0)).current;

  // State for storing the current index of the carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reference to the FlatList component for manual scroll control
  const flatListRef = useRef<FlatList<Item>>(null);

  // Reference for managing autoplay intervals
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

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
    (e) => {
      const offsetX = e.nativeEvent.contentOffset.x; // Get the horizontal scroll offset
      scrollX.setValue(offsetX); // Update the scroll position for animations
      const nextIndex = Math.round(offsetX / itemWidth); // Calculate the current index
      // If the index changes, call the onSnap callback
      if (nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex); // Update the state with the new index
        onSnap(nextIndex);
      }
    },
    [
      currentIndex, // Dependency to ensure the effect updates when currentIndex changes
      data?.length, // Ensure this recalculates when data length changes
      itemWidth, // Recalculate if itemWidth changes
      onSnap, // Dependency on onSnap callback
      scrollX, // Dependency on scrollX for animated transitions
    ]
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
  const goToIndex = useCallback(
    (index: number) => {
      // Calculate the index with wrapping around (modulo operation)
      let loopedIndex = index;
      if (loop) {
        loopedIndex = (index + data.length) % data.length;
      }
      // Ensure the FlatList reference is available before attempting to scroll
      if (flatListRef.current) {
        const offset = calculateItemOffsetStatic(loopedIndex); // Calculate the offset for the given index
        flatListRef.current?.scrollToOffset({ animated: true, offset }); // Scroll to the desired offset
        setCurrentIndex(loopedIndex); // Update the current index state
        onSnap(loopedIndex); // Trigger the onSnap callback to notify the parent component
      }
    },
    [data.length, calculateItemOffsetStatic, onSnap]
  );

  /**
   * startAutoplay starts the autoplay functionality by setting an interval to change the index every 3 seconds.
   * It only starts if autoplay is not already running.
   */
  const startAutoplay = useCallback(() => {
    // Start the autoplay cycle only if it's not already running
    if (autoplayRef.current) {
      return;
    }
    autoplayRef.current = setInterval(
      () => {
        // Automatically loop to the next index and reset to 0 if at the last item
        let nextIndex = 0;
        if (loop) {
          nextIndex = (currentIndex + 1) % data.length;
          goToIndex(nextIndex);
        } else {
          if (currentIndex + 1 > data.length - 1) {
            stopAutoplay();
          } else {
            nextIndex = currentIndex + 1;
            goToIndex(nextIndex);
          }
        }
      },
      autoPlayInterval ? autoPlayInterval : 3000
    ); // Advance every 3 seconds
  }, [goToIndex, currentIndex, data.length]);

  /**
   * stopAutoplay stops the autoplay functionality by clearing the interval.
   */
  const stopAutoplay = useCallback(() => {
    // Stop the autoplay cycle if it is running
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  // UseEffect hook to start/stop autoplay based on the `autoPlay` prop
  useEffect(() => {
    if (autoPlay) {
      startAutoplay(); // Start autoplay if enabled
      return () => {
        // Cleanup autoplay when component unmounts or autoPlay is turned off
        stopAutoplay();
      };
    } else {
      // If autoplay is disabled, clear the interval
      stopAutoplay();
    }
  }, [autoPlay, startAutoplay]);

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
    [sliderWidth, itemWidth] // Recalculate if sliderWidth or itemWidth changes
  );

  /**
   * keyExtractorInternal extracts a unique key for each item, either using the provided `keyExtractor`
   * or falling back to the index if not provided.
   */
  const keyExtractorInternal = useCallback<
    NonNullable<FlatListProps<Item>['keyExtractor']>
  >(
    (item: Item, index: number) =>
      keyExtractor ? keyExtractor(item, index) : index.toString(),
    [keyExtractor] // Recalculate if keyExtractor changes
  );

  /**
   * renderItemInternal renders each item in the carousel with an animated scale effect.
   * The scale is interpolated based on the scroll position (using scrollX) to give a zooming effect
   * as items approach or leave the center of the viewport.
   */
  const renderItemInternal = useCallback<ListRenderItem<Item>>(
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
                    calculateCenteredItemOffset(index), // Current item
                    calculateCenteredItemOffset(index + 1), // Right item
                  ],
                  outputRange: [
                    inactiveScale ? inactiveScale : 0.8,
                    1,
                    inactiveScale ? inactiveScale : 0.8,
                  ], // Scale items to 0.8 when off-center and 1 when centered
                  extrapolate: 'clamp', // Clamp the scale to avoid values beyond the range
                }),
              },
            ],
          },
        ]}
      >
        {renderItem({ item, index })}
      </Animated.View>
    ),
    [calculateCenteredItemOffset, itemWidth, renderItem, scrollX] // Recalculate when these values change
  );

  return (
    <View
      style={[styles.container, { width: sliderWidth }]}
      accessibilityLabel={accessibilityLabelCarousel}
    >
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
