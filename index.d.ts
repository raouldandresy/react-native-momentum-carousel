import * as React from 'react';
import { ListRenderItem } from 'react-native';

/**
 * CarouselProps defines the expected properties for the CarouselMomentum component.
 * - `data`: Array of items to be displayed in the carousel.
 * - `sliderWidth`: The width of the carousel container (viewport).
 * - `itemWidth`: The width of each individual item in the carousel.
 * - `renderItem`: A function to render each item in the carousel.
 * - `keyExtractor`: An optional function that provides a unique key for each item (defaults to index if not provided).
 * - `onSnap`: A callback that is triggered when an item is snapped to the center of the carousel.
 * - `accessibilityLabelCarousel`: Optional string for accessibility label of the carousel.
 * - `onMomentumScrollStart`: A callback triggered when momentum scroll starts.
 * - `onMomentumScrollEnd`: A callback triggered when momentum scroll ends.
 */
declare interface CarouselProps<Item> {
  data: Item[]; // The list of data items to display in the carousel
  sliderWidth: number; // The width of the carousel container
  itemWidth: number; // The width of each carousel item
  renderItem: ListRenderItem<Item>; // Function to render each individual item
  keyExtractor?: (item: Item, index: number) => string; // Optional function to extract a unique key for each item
  onSnap: (index: number) => void; // Callback function when the carousel snaps to a new item
  accessibilityLabelCarousel?: string; // Optional accessibility label for the carousel
  onMomentumScrollStart: () => void; // Callback function triggered when scroll momentum starts
  onMomentumScrollEnd: () => void; // Callback function triggered when scroll momentum ends
}

/**
 * CarouselMomentum is a React class component that implements a carousel with snapping behavior.
 * It supports scrolling through the items, animated transitions, and snapping to the closest item.
 */
declare class CarouselMomentum extends React.Component<
  CarouselProps<any>, // CarouselProps<any> is a generic prop type that accepts any item type
  any // The component state (can be extended to specify the state if needed)
> {}

export { CarouselMomentum }; // Export the CarouselMomentum class to make it available for use in other parts of the application.
