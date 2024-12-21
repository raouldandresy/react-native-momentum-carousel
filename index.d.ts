import * as React from 'react';
import { ListRenderItem } from 'react-native';

declare interface CarouselProps<Item> {
  data: Item[];
  sliderWidth: number;
  itemWidth: number;
  renderItem: ListRenderItem<Item>;
  keyExtractor?: (item: Item, index: number) => string;
  onSnapToItem: (index: number) => void;
  accessibilityLabelCarousel?: string;
}

declare class CarouselMomentum extends React.Component<
  CarouselProps<any>,
  any
> {}

export { CarouselMomentum };
