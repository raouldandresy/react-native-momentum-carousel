import * as React from 'react';
import { ListRenderItem } from 'react-native';

declare interface CarouselProps<Item> {
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

declare class CarouselMomentum extends React.Component<
  CarouselProps<any>,
  any
> {}

export { CarouselMomentum };
