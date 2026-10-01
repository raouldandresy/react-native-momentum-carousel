import React, {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  useMemo,
  ForwardedRef,
  useEffect,
  PropsWithoutRef,
  RefAttributes,
  Component,
  ComponentClass,
} from 'react';
import {
  View,
  FlatList,
  ListRenderItem,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
  findNodeHandle,
  AccessibilityInfo,
  ViewToken,
} from 'react-native';
import Pagination from './Pagination';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import ItemCarousel from './ItemCarousel';

/**
 * CarouselProps defines the expected properties for the CarouselMomentum component.
 * - `data`: Array of items to display in the carousel.
 * - `sliderWidth`: The width of the carousel container.
 * - `itemWidth`: The width of each individual item in the carousel.
 * - `renderItem`: Function that renders each item in the carousel.
 * - `keyExtractor`: Function that provides a unique key for each item, defaulting to index if not provided.
 * - `onSnap`: Callback that is triggered when an item is snapped to the center of the carousel.
 * - `accessibilityLabelCarousel`: Optional accessibility label for the carousel.
 * - `onMomentumScrollBegin`: Optional Callback triggered when momentum scrolling starts.
 * - `onMomentumScrollEnd`: Optional Callback triggered when momentum scrolling ends.
 * - `autoPlay`: Optional boolean to enable automatic scrolling through the carousel.
 * - `loop`: Optional boolean to loop the carousel back to the start after reaching the last item.
 * - `autoPlayInterval`: Optional number for automatic scrolling through the carousel.
 * - `inactiveScale`: Optional number for scale inactive items
 * - `showPagination`: Optional boolean to show pagination component.
 * - `paginationStyle`: Optional style for pagination component {container:{},bullet:{},activeBullet:{}}.
 * - `animation`: CarouselMomentumAnimationType Enum to choose the suitable animation.
 * - `customAnimation`: Optional boolean to avoid default animation.
 */
interface CarouselProps<Item> extends Pick<
  FlatListProps<Item>,
  | 'onEndReached'
  | 'onEndReachedThreshold'
  | 'onContentSizeChange'
  | 'onLayout'
  | 'onRefresh'
  | 'onViewableItemsChanged'
> {
  carouselStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  data: Item[];
  sliderWidth?: number;
  itemWidth?: number;
  vertical?: boolean;
  sliderHeight?: number;
  itemHeight?: number;
  renderItem: ListRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  onSnap: (index: number) => void;
  accessibilityLabelCarousel?: string;
  onMomentumScrollBegin?: () => void;
  onMomentumScrollEnd?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  autoPlayInterval?: number;
  inactiveScale?: number;
  showPagination?: boolean;
  paginationStyle?: {
    container?: StyleProp<ViewStyle>;
    bullet?: StyleProp<ViewStyle>;
    activeBullet?: StyleProp<ViewStyle>;
  };
  animation: CarouselMomentumAnimationType;
  customAnimation?: boolean;
}

export interface CarouselRef {
  getCurrentIndex: () => number; // Method to get the current index of the carousel
  goToIndex: (index: number) => void; // Method to scroll to a specific index
}

export enum CarouselMomentumAnimationType {
  Default,
  Stack,
  Tinder,
}

/**
 * CarouselMomentum component renders a horizontal scrollable carousel.
 * - It supports animated transitions and snap-to-item behavior.
 * - It uses `Animated.FlatList` to enable animation during scroll.
 */
const CarouselMomentum = <Item,>(
  {
    carouselStyle,
    itemStyle,
    data,
    sliderWidth,
    itemWidth,
    vertical = false,
    sliderHeight,
    itemHeight,
    renderItem,
    keyExtractor,
    onSnap,
    accessibilityLabelCarousel,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    autoPlay,
    loop,
    autoPlayInterval,
    inactiveScale,
    showPagination,
    paginationStyle,
    animation,
    customAnimation,
    onEndReached,
    onEndReachedThreshold,
    onContentSizeChange,
    onLayout,
    onRefresh,
    onViewableItemsChanged,
    ...otherProps
  }: CarouselProps<Item>,
  ref: ForwardedRef<CarouselRef>
) => {
  if (vertical && (!sliderHeight || isNaN(sliderHeight))) {
    throw 'Needed a right number value for sliderHeight';
  }
  if (vertical && (!itemHeight || isNaN(itemHeight))) {
    throw 'Needed a right number value for itemHeight';
  }
  if (!vertical && (!sliderWidth || isNaN(sliderWidth))) {
    throw 'Needed a right number value for sliderWidth';
  }
  if (!vertical && (!itemWidth || isNaN(itemWidth))) {
    throw 'Needed a right number value for itemWidth';
  }

  // Reference to track the horizontal scroll position for animations
  const scrollX = useSharedValue(0);

  // State for storing the current index of the carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const physicalIndexRef = useRef(loop && data.length > 1 ? data.length : 0);
  const lastSnappedIndexRef = useRef(0);

  // Reference to the FlatList component for manual scroll control
  const flatListRef = useRef<FlatList<Item> | null>(null);

  // Reference for managing autoplay intervals
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemSize = vertical ? itemHeight! : itemWidth!;
  const isLoopEnabled = Boolean(loop && data.length > 1);
  const listData = useMemo(
    () => (isLoopEnabled ? [...data, ...data, ...data] : data),
    [data, isLoopEnabled]
  );

  // Expose imperative methods to the parent component via the `ref`
  useImperativeHandle(ref, () => ({
    getCurrentIndex: () => currentIndex, // Get the current index of the carousel
    goToIndex: (index) => goToIndex(index), // Method to scroll to a specific index
  }));

  const updatePhysicalIndex = useCallback(
    (physicalIndex: number) => {
      physicalIndexRef.current = physicalIndex;
      const logicalIndex = isLoopEnabled
        ? physicalIndex % data.length
        : Math.max(0, Math.min(physicalIndex, data.length - 1));
      currentIndexRef.current = logicalIndex;
      setCurrentIndex(logicalIndex);
    },
    [data.length, isLoopEnabled]
  );

  const reportSnappedIndex = useCallback(
    (physicalIndex: number) => {
      const logicalIndex = isLoopEnabled
        ? physicalIndex % data.length
        : Math.max(0, Math.min(physicalIndex, data.length - 1));
      updatePhysicalIndex(physicalIndex);
      if (logicalIndex !== lastSnappedIndexRef.current) {
        lastSnappedIndexRef.current = logicalIndex;
        onSnap(logicalIndex);
      }
    },
    [data.length, isLoopEnabled, onSnap, updatePhysicalIndex]
  );

  /**
   * Calculates the static offset of an item based on its index.
   */
  const calculateItemOffsetStatic = useCallback(
    (index: number) => index * itemSize,
    [itemSize]
  );

  const settleAtPhysicalIndex = useCallback(
    (physicalIndex: number) => {
      reportSnappedIndex(physicalIndex);
      const logicalIndex = isLoopEnabled
        ? physicalIndex % data.length
        : Math.max(0, Math.min(physicalIndex, data.length - 1));

      if (
        isLoopEnabled &&
        (physicalIndex < data.length || physicalIndex >= data.length * 2)
      ) {
        const centeredIndex = data.length + logicalIndex;
        physicalIndexRef.current = centeredIndex;
        flatListRef.current?.scrollToOffset({
          animated: false,
          offset: calculateItemOffsetStatic(centeredIndex),
        });
      }
    },
    [calculateItemOffsetStatic, data.length, isLoopEnabled, reportSnappedIndex]
  );

  /**
   * handleScroll is invoked during the scroll event to update the current index.
   */
  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        const offset = vertical ? event.contentOffset.y : event.contentOffset.x;
        scrollX.set(offset);
        const physicalIndex = Math.round(offset / itemSize);
        const nextIndex = isLoopEnabled
          ? physicalIndex % data.length
          : Math.max(0, Math.min(physicalIndex, data.length - 1));
        if (nextIndex !== currentIndex) {
          runOnJS(updatePhysicalIndex)(physicalIndex);
        }
      },
    },
    [
      currentIndex,
      data.length,
      isLoopEnabled,
      itemSize,
      updatePhysicalIndex,
      vertical,
    ]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = vertical
        ? event.nativeEvent.contentOffset.y
        : event.nativeEvent.contentOffset.x;
      const physicalIndex = Math.round(offset / itemSize);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
      settleAtPhysicalIndex(physicalIndex);

      onMomentumScrollEnd?.();
    },
    [itemSize, onMomentumScrollEnd, settleAtPhysicalIndex, vertical]
  );

  const handleMomentumScrollBegin = useCallback(() => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    onMomentumScrollBegin?.();
  }, [onMomentumScrollBegin]);

  const handleScrollEndDrag = useCallback(() => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }
    snapTimeoutRef.current = setTimeout(() => {
      snapTimeoutRef.current = null;
      settleAtPhysicalIndex(physicalIndexRef.current);
    }, 300);
  }, [settleAtPhysicalIndex]);

  const scrollToPhysicalIndex = useCallback(
    (physicalIndex: number) => {
      if (!flatListRef.current) {
        return;
      }
      flatListRef.current.scrollToOffset({
        animated: true,
        offset: calculateItemOffsetStatic(physicalIndex),
      });
      updatePhysicalIndex(physicalIndex);
    },
    [calculateItemOffsetStatic, updatePhysicalIndex]
  );

  /**
   * goToIndex scrolls to a specific index and updates the current index state.
   * The requested index wraps when looping and clamps otherwise.
   */
  const goToIndex = useCallback(
    (index: number) => {
      if (!Number.isFinite(index)) {
        throw new RangeError('index must be a finite number');
      }
      if (data.length === 0) {
        return;
      }

      let loopedIndex = Math.max(
        0,
        Math.min(Math.trunc(index), data.length - 1)
      );
      if (loop) {
        loopedIndex =
          ((Math.trunc(index) % data.length) + data.length) % data.length;
      }
      if (flatListRef.current) {
        const physicalIndex = isLoopEnabled
          ? data.length + loopedIndex
          : loopedIndex;
        scrollToPhysicalIndex(physicalIndex);
      }
    },
    [loop, data.length, isLoopEnabled, scrollToPhysicalIndex]
  );

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

  /**
   * startAutoplay starts the autoplay functionality by setting an interval to change the index every 3 seconds.
   * It only starts if autoplay is not already running.
   */
  const startAutoplay = useCallback(() => {
    if (data.length <= 1) {
      stopAutoplay();
      return;
    }
    // Start the autoplay cycle only if it's not already running
    if (autoplayRef.current) {
      return;
    }
    autoplayRef.current = setInterval(
      () => {
        // Automatically loop to the next index and reset to 0 if at the last item
        if (loop) {
          scrollToPhysicalIndex(physicalIndexRef.current + 1);
        } else if (currentIndexRef.current + 1 > data.length - 1) {
          stopAutoplay();
        } else {
          goToIndex(currentIndexRef.current + 1);
        }
      },
      Number.isFinite(autoPlayInterval) && autoPlayInterval! > 0
        ? autoPlayInterval!
        : 3000
    ); // Advance every 3 seconds
  }, [
    autoPlayInterval,
    loop,
    data.length,
    goToIndex,
    scrollToPhysicalIndex,
    stopAutoplay,
  ]);

  // UseEffect hook to start/stop autoplay based on the `autoPlay` prop
  useEffect(() => {
    if (autoPlay) {
      // Start autoplay if enabled
      startAutoplay();
    } else {
      // If autoplay is disabled, clear the interval
      stopAutoplay();
    }

    return () => {
      // Cleanup autoplay when component unmounts or autoPlay is turned off
      stopAutoplay();
    };
  }, [autoPlay, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    const nextIndex =
      data.length === 0
        ? 0
        : loop
          ? currentIndexRef.current % data.length
          : Math.min(currentIndexRef.current, data.length - 1);
    currentIndexRef.current = nextIndex;
    physicalIndexRef.current = isLoopEnabled
      ? data.length + nextIndex
      : nextIndex;
    lastSnappedIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToOffset({
      animated: false,
      offset:
        data.length === 0
          ? 0
          : calculateItemOffsetStatic(
              isLoopEnabled ? data.length + nextIndex : nextIndex
            ),
    });
  }, [calculateItemOffsetStatic, data.length, isLoopEnabled, loop]);

  useEffect(
    () => () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    },
    []
  );

  const getHandleItemInternalRef = useCallback(
    (index: number) => {
      return (itemRef: View | null) => {
        const logicalIndex = isLoopEnabled ? index % data.length : index;
        if (
          index !== physicalIndexRef.current ||
          logicalIndex !== currentIndex ||
          itemRef === null
        ) {
          return;
        }

        const castedRef = itemRef as FindNodeHandleParam;
        const reactTag = findNodeHandle(castedRef);
        if (!reactTag) {
          return;
        }
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      };
    },
    [currentIndex, data.length, isLoopEnabled]
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

  const handleViewableItemsChanged = useCallback<
    NonNullable<FlatListProps<Item>['onViewableItemsChanged']>
  >(
    (info) => {
      if (!onViewableItemsChanged) {
        return;
      }
      if (!isLoopEnabled) {
        onViewableItemsChanged(info);
        return;
      }

      const normalizeToken = (token: ViewToken<Item>) => {
        if (token.index === null) {
          return token;
        }
        const logicalIndex = token.index % data.length;
        return {
          ...token,
          index: logicalIndex,
          key: keyExtractorInternal(token.item, logicalIndex),
        };
      };
      const normalizedItems = new Map<number, ViewToken<Item>>();
      info.viewableItems.forEach((token) => {
        const normalized = normalizeToken(token);
        if (normalized.index !== null) {
          normalizedItems.set(normalized.index, normalized);
        }
      });
      const normalizedChanged = new Map<number, ViewToken<Item>>();
      info.changed.forEach((token) => {
        const normalized = normalizeToken(token);
        if (normalized.index !== null) {
          normalizedChanged.set(normalized.index, normalized);
        }
      });
      onViewableItemsChanged({
        ...info,
        viewableItems: Array.from(normalizedItems.values()),
        changed: Array.from(normalizedChanged.values()),
      });
    },
    [data.length, isLoopEnabled, keyExtractorInternal, onViewableItemsChanged]
  );

  /**
   * renderItemInternal renders each item in the carousel with an animated scale effect.
   * The scale is interpolated based on the scroll position (using scrollX) to give a zooming effect
   * as items approach or leave the center of the viewport.
   */
  const renderItemInternal = useCallback<ListRenderItem<Item>>(
    (info) => {
      const logicalIndex = isLoopEnabled
        ? info.index % data.length
        : info.index;
      return (
        <ItemCarousel
          getHandleItemInternalRef={getHandleItemInternalRef}
          itemStyle={itemStyle}
          renderItem={renderItem}
          info={info}
          renderInfo={
            logicalIndex === info.index
              ? info
              : { ...info, index: logicalIndex }
          }
          itemWidth={itemWidth!}
          inactiveScale={inactiveScale}
          scrollX={scrollX}
          animation={animation}
          itemHeight={itemHeight!}
          vertical={vertical}
          customAnimation={customAnimation}
        />
      );
    },
    [
      animation,
      customAnimation,
      data.length,
      getHandleItemInternalRef,
      inactiveScale,
      isLoopEnabled,
      itemHeight,
      itemStyle,
      itemWidth,
      renderItem,
      scrollX,
      vertical,
    ] // Recalculate when these values change
  );

  return (
    <View
      style={[
        !vertical ? { width: sliderWidth } : { height: sliderHeight },
        carouselStyle,
      ]}
      accessibilityLabel={accessibilityLabelCarousel}
    >
      {/* The main AnimatedFlatList that renders the carousel */}
      <Animated.FlatList
        {...otherProps}
        ref={flatListRef} // Reference to FlatList for direct manipulation
        data={listData} // The data to display in the carousel
        keyExtractor={(item, index) =>
          isLoopEnabled
            ? `${keyExtractorInternal(item, index % data.length)}-${index}`
            : keyExtractor
              ? keyExtractor(item, index)
              : keyExtractorInternal(item, index)
        }
        initialScrollIndex={isLoopEnabled ? data.length : 0}
        getItemLayout={(_, index) => ({
          length: itemSize,
          offset: itemSize * index,
          index,
        })}
        horizontal={!vertical} // Display items horizontally
        showsHorizontalScrollIndicator={false} // Hide the scroll indicator
        onEndReached={isLoopEnabled ? undefined : onEndReached}
        onEndReachedThreshold={
          isLoopEnabled ? undefined : onEndReachedThreshold
        }
        onContentSizeChange={isLoopEnabled ? undefined : onContentSizeChange}
        onLayout={onLayout}
        onRefresh={onRefresh}
        onViewableItemsChanged={handleViewableItemsChanged}
        snapToInterval={!vertical ? itemWidth : itemHeight} // Snapping behavior after each item
        decelerationRate="fast" // Fast deceleration for smooth scrolling
        bounces={false} // Disable the bounce effect on scroll edges
        onScroll={scrollHandler} // Handle scroll events
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16} // Throttle scroll event updates for smoother performance
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        renderItem={renderItemInternal} // Render each item with animation
        contentContainerStyle={
          !vertical
            ? {
                paddingHorizontal: (sliderWidth! - itemWidth!) / 2, // Center the items within the container
              }
            : {
                paddingVertical: (sliderHeight! - itemHeight!) / 2,
              }
        }
        showsVerticalScrollIndicator={false}
      />
      {showPagination && !vertical && (
        <Pagination
          dataLength={data.length}
          currentIndex={currentIndex}
          paginationStyle={paginationStyle}
        />
      )}
    </View>
  );
};

// Forward ref to the CarouselMomentum component to expose imperative methods to the parent
const WithForwardedRef = React.forwardRef(CarouselMomentum);

// Wrap the component with React.memo for performance optimization (prevents unnecessary re-renders)
const Memoized = React.memo(WithForwardedRef);

export default Memoized as GenericForwardRefExoticComponent; // Export the memoized component

type GenericForwardRefExoticComponent = <Item>(
  props: PropsWithoutRef<CarouselProps<Item>> & RefAttributes<CarouselRef>
) => React.ReactNode;

type FindNodeHandleParam =
  number | ComponentClass<any, any> | Component<any, any, any> | null;
