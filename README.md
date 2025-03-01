# CarouselMomentum

A customizable, animated, horizontal carousel component for React Native. The `CarouselMomentum` component enables smooth, momentum-based scrolling with features such as autoplay, looping, animated item scaling, and pagination. It is built using `Animated.FlatList` from react-native-reanimated to provide smooth transitions during item scroll.

## Features
- **Momentum Scroll:** Smooth transitions with momentum-based scrolling.
- **Autoplay:** Automatically scrolls through the items at a specified interval.
- **Looping:** Option to loop the carousel after reaching the last item.
- **Scaling Effect:** Inactive items scale down as they move away from the center of the carousel.
- **Snapping:** Items snap to position when scrolling stops.
- **Customizable:** Easily configurable with props like `sliderWidth`, `itemWidth`, `onSnap`, etc.
- **Pagination:** Optional pagination indicators for improved navigation.
- **Animations:** Choose from different animation styles for transitions.

## Installation

To use the `CarouselMomentum` component, you can install it through `npm` or `yarn`.

```bash
npm install react-native-momentum-carousel
```

or

```bash
yarn add react-native-momentum-carousel
```

## Example Usage

### 1. Basic Usage:

```tsx
import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import CarouselMomentum from 'react-native-momentum-carousel';

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
        showPagination={true}
      />
      <Text style={{ textAlign: 'center', marginTop: 20 }}>Current Index: {currentIndex}</Text>
    </View>
  );
};

export default App;
```

### 2. Customizing the Carousel

```tsx
<CarouselMomentum
  data={data}
  sliderWidth={300}
  itemWidth={200}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  onSnap={(index) => console.log('Snapped to item:', index)}
  autoPlay={true}
  autoPlayInterval={5000}
  loop={true}
  inactiveScale={0.7}
  showPagination={true}
  paginationStyle={{ container: {}, bullet: {}, activeBullet: {} }}
  animation={'Stack'}
  customAnimation={false}
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
- **`showPagination`**: Boolean to show pagination indicators.
- **`paginationStyle`**: Style object for customizing pagination appearance.
- **`animation`**: Enum defining the animation type (`Default`, `Stack`, `Tinder`).
- **`customAnimation`**: Boolean to enable custom animations.

## Methods

When using the `CarouselMomentum` component with a ref, you can access the following imperative methods:

- **`getCurrentIndex()`**: Returns the current index of the carousel.
- **`goToIndex(index: number)`**: Scrolls the carousel to the specified index.

### Example of Using Imperative Methods:

```tsx
import React, { useRef } from 'react';
import { Button, View } from 'react-native';
import CarouselMomentum from 'react-native-momentum-carousel';

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

## 🖼️ Demo

Here’s a quick demo of how the component works:

![Demo GIF](https://github.com/raouldandresy/gif/blob/main/react-native-momentum-carousel.gif)

## Notes

- To provide right behaviour for the Accessibility on snapping, you need to configure the full width/height. It means that the slider and item has to be the same size.

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## License

This component is open source and released under the MIT License.

