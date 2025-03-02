import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  ListRenderItem,
  ListRenderItemInfo,
} from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { CarouselMomentumAnimationType } from './CarouselMomentum';
import { useLayoutConfig } from './useLayoutConfig';

// ItemCarouselProps defines the properties for each item in the carousel.
// These props are used to configure the appearance and behavior of the carousel items.
export interface ItemCarouselProps {
  // Function to get a reference to the internal View component of the item for accessibility handling
  getHandleItemInternalRef: (index: number) => (_ref: View | null) => void;

  // The width and height of the individual carousel item
  itemWidth: number;
  itemHeight: number;

  // Optional style to apply to each carousel item
  itemStyle?: StyleProp<ViewStyle>;

  // The function responsible for rendering each item in the carousel
  renderItem: ListRenderItem<any>;

  // Info passed by FlatList that contains item data and other information
  info: ListRenderItemInfo<any>;

  // Shared value for scroll position used to create animations based on scrollX
  scrollX: SharedValue<number>;

  // Optional scale to apply to inactive items when they are out of the center
  inactiveScale?: number;

  // Defines which type of animation to use for the carousel item
  animation: CarouselMomentumAnimationType;

  // Indicates if the carousel is in vertical mode
  vertical: boolean;

  // Optional flag for custom animations for the carousel item
  customAnimation?: boolean;
}

// ItemCarousel component renders each item in the carousel.
// It applies the necessary styles and animations based on the scroll position.
const ItemCarousel: React.FC<ItemCarouselProps> = ({
  getHandleItemInternalRef,
  itemWidth,
  itemStyle,
  renderItem,
  info,
  scrollX,
  inactiveScale,
  animation,
  itemHeight,
  vertical,
  customAnimation,
}) => {
  // Collect all the necessary props into a data object to be used for layout configuration
  const data = {
    getHandleItemInternalRef,
    itemWidth,
    itemStyle,
    renderItem,
    info,
    scrollX,
    inactiveScale,
    animation,
    itemHeight,
    vertical,
  };

  // Use the layout configuration hook to calculate animation and layout properties for each item
  const layoutConfig = useLayoutConfig(data);

  return (
    <Animated.View
      // Set a reference for the current item using the index to manage accessibility
      ref={getHandleItemInternalRef(info.index)}
      style={[
        {
          width: itemWidth, // Set the width of the item
          height: itemHeight, // Set the height of the item
        },
        // If customAnimation is not set, apply the layoutConfig (animations and styles)
        !customAnimation ? layoutConfig : {},
        itemStyle, // Apply the optional item style
      ]}
    >
      {/* Render the item using the provided renderItem function */}
      {renderItem(info)}
    </Animated.View>
  );
};

// Export the ItemCarousel component as the default export
export default ItemCarousel;
