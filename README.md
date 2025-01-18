# CarouselMomentum

A customizable, animated, horizontal carousel component for React Native. The `CarouselMomentum` component enables smooth, momentum-based scrolling with features such as autoplay, looping, and animated item scaling. It is built using `Animated.FlatList` to provide smooth transitions during item scroll.

## Features
- **Momentum Scroll:** Smooth transitions with momentum-based scrolling.
- **Autoplay:** Automatically scrolls through the items at a specified interval.
- **Looping:** Option to loop the carousel after reaching the last item.
- **Scaling Effect:** Inactive items scale down as they move away from the center of the carousel.
- **Snapping:** Items snap to position when scrolling stops.
- **Customizable:** Easily configurable with props like `sliderWidth`, `itemWidth`, `onSnap`, etc.

## Installation

To use the `CarouselMomentum` component, you can install it through `npm` or `yarn`.

```bash
npm install carousel-momentum
```

or

```bash
yarn add carousel-momentum
```

## Example Usage

Here’s a quick example of how to use the `CarouselMomentum` component.

### 1. Basic Usage:

```tsx
import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import CarouselMomentum from 'carousel-momentum';

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const data = [
    { id: '1', title: 'Item 1', imageUrl: 'https://example.com/image1.jpg' },
    { id: '2', title: 'Item 2', imageUrl: 'https://example.com/image2.jpg' },
    { id: '3', title: 'Item 3', imageUrl: 'https://example.com/image3.jpg' },
  ];

  const renderItem = ({ item }) => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Image source={{ uri: item.imageUrl }} style={{ width: 200, height: 200 }} />
      <Text>{item.title}</Text>
    </View>
  );

  const onSnap = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <CarouselMomentum
        data={data}
        sliderWidth={300}
        itemWidth={200}
        renderItem={renderItem}
        onSnap={onSnap}
        autoPlay={true}
        autoPlayInterval={3000}
        loop={true}
        inactiveScale={0.8}
      />
      <Text style={{ textAlign: 'center', marginTop: 20 }}>Current Index: {currentIndex}</Text>
    </View>
  );
};

export default App;
```

### 2. Customizing the Carousel

You can customize the behavior of the carousel through various props.

```tsx
<CarouselMomentum
  data={data} // Array of items to display
  sliderWidth={300} // Width of the carousel container
  itemWidth={200} // Width of each carousel item
  renderItem={renderItem} // Render function for each item
  keyExtractor={(item) => item.id} // Key extractor for list items
  onSnap={(index) => console.log('Snapped to item:', index)} // Callback when an item is centered
  accessibilityLabelCarousel="Image carousel" // Optional accessibility label
  autoPlay={true} // Enable auto-scroll
  autoPlayInterval={5000} // Time interval for auto-scroll (in ms)
  loop={true} // Enable loop when reaching the last item
  inactiveScale={0.7} // Scale of items when they are not in focus
/>
```

## Props

### Required Props:

- **`data`**: Array of items to display in the carousel. Each item should have a unique `id` or key.
- **`sliderWidth`**: The width of the carousel container.
- **`itemWidth`**: The width of each individual item.
- **`renderItem`**: Function to render each item. Receives an object with `item` and `index` properties.
- **`onSnap`**: Callback function triggered when an item is snapped to the center.

### Optional Props:

- **`keyExtractor`**: Function to extract a unique key for each item. Defaults to using the index if not provided.
- **`accessibilityLabelCarousel`**: Optional string for the carousel's accessibility label.
- **`onMomentumScrollStart`**: Callback triggered when momentum scrolling starts.
- **`onMomentumScrollEnd`**: Callback triggered when momentum scrolling ends.
- **`autoPlay`**: If `true`, the carousel will automatically scroll through the items.
- **`loop`**: If `true`, the carousel will loop back to the first item after reaching the end.
- **`autoPlayInterval`**: Time interval (in ms) for auto-play. Defaults to 3000ms.
- **`inactiveScale`**: Scale value for inactive items. Defaults to 0.8.

## Methods

When using the `CarouselMomentum` component with a ref, you can access the following imperative methods:

- **`getCurrentIndex()`**: Returns the current index of the carousel.
- **`goToIndex(index: number)`**: Scrolls the carousel to the specified index.

### Example of Using Imperative Methods:

```tsx
import React, { useRef } from 'react';
import { Button, View } from 'react-native';
import CarouselMomentum from 'carousel-momentum';

const App = () => {
  const carouselRef = useRef();

  const goToFirstItem = () => {
    carouselRef.current?.goToIndex(0);
  };

  return (
    <View style={{ flex: 1 }}>
      <CarouselMomentum
        ref={carouselRef}
        data={data}
        sliderWidth={300}
        itemWidth={200}
        renderItem={renderItem}
        onSnap={(index) => console.log('Snapped to item:', index)}
      />
      <Button title="Go to First Item" onPress={goToFirstItem} />
    </View>
  );
};

export default App;
```

## Styling

You can customize the carousel's appearance by modifying the `styles` used in the component. For instance, to adjust the container, item, or other aspects of the UI, you can create a custom `style` file.

```ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    // Style the container of the carousel
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    // Style each individual item in the carousel
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
```

## Notes

- The `CarouselMomentum` component uses `Animated.FlatList` internally to provide smooth scroll animations.
- The component supports both horizontal and vertical scrolling, but this implementation focuses on horizontal scrolling.

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## License

This component is open source and released under the MIT License.
