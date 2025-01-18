import * as React from 'react';
import { ListRenderItem } from 'react-native';


/**
 * CarouselProps defines the expected properties for the CarouselMomentum component.
 * These properties are used to configure the carousel, its behavior, and appearance.
 * 
 * - `data`: Array of items to be displayed in the carousel.
 * - `sliderWidth`: The width of the carousel container (viewport).
 * - `itemWidth`: The width of each individual item in the carousel.
 * - `renderItem`: A function to render each item in the carousel.
 * - `keyExtractor`: An optional function that provides a unique key for each item (defaults to index if not provided).
 * - `onSnap`: A callback that is triggered when an item is snapped to the center of the carousel.
 * - `accessibilityLabelCarousel`: Optional string for accessibility label of the carousel, improving accessibility.
 * - `onMomentumScrollStart`: A callback triggered when momentum scrolling starts.
 * - `onMomentumScrollEnd`: A callback triggered when momentum scrolling ends.
 * - `autoPlay`: An optional boolean that, if set to `true`, enables automatic scrolling through the carousel items.
 * - `loop`: Optional boolean that enables looping the carousel when reaching the last item.
 */
declare interface CarouselProps<Item> {
  data: Item[]; // Array of items to display in the carousel
  sliderWidth: number; // Width of the carousel container (viewport)
  itemWidth: number; // Width of each individual carousel item
  renderItem: ListRenderItem<Item>; // Function that renders each item
  keyExtractor?: (item: Item, index: number) => string; // Optional function to generate a unique key for each item (defaults to index)
  onSnap: (index: number) => void; // Callback triggered when the carousel snaps to a new item
  accessibilityLabelCarousel?: string; // Optional accessibility label for the carousel
  onMomentumScrollStart?: () => void; // Optional Callback triggered when momentum scrolling starts
  onMomentumScrollEnd?: () => void; // Optional Callback triggered when momentum scrolling ends
  autoPlay?: boolean; // Optional boolean to enable automatic scrolling through the carousel items
  loop?: boolean; // Optional boolean to enable looping of the carousel
  autoPlayInterval?: number; // Optional number for automatic scrolling through the carousel items
}

/**
 * CarouselMomentum is a React class component that implements a carousel with snapping behavior.
 * It supports scrolling through the items, animated transitions, and snapping to the closest item.
 * The `autoPlay` feature can be enabled to automatically cycle through the items.
 */
declare class CarouselMomentum extends React.Component<
  CarouselProps<any>, // CarouselProps<any> is a generic type that accepts any type of item in the carousel
  any // The component state (can be further specified to better handle the state)
> {}

export { CarouselMomentum }; // Export the CarouselMomentum class so it can be imported and used elsewhere in the application
