import { CarouselMomentumAnimationType } from './CarouselMomentum';
import { ItemCarouselProps } from './ItemCarousel';
import {
  useLayoutStackAnimation,
  useLayoutDefaultAnimation,
  useLayoutTinderAnimation,
} from './useLayoutAnimation';

export function useLayoutConfig(data: ItemCarouselProps) {
  const stack = useLayoutStackAnimation(data);
  const sample = useLayoutDefaultAnimation(data);
  const tinder = useLayoutTinderAnimation(data);
  switch (data.animation) {
    case CarouselMomentumAnimationType.Stack:
      return stack;
    case CarouselMomentumAnimationType.Tinder:
      return tinder;
    default:
      return sample;
  }
}
