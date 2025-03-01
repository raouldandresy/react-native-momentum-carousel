import { useMemo } from 'react';
import { ItemCarouselProps } from './ItemCarousel';
import {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

/**
 * useLayoutStackAnimation calculates the animated style for a stack-style carousel animation.
 * It creates an opacity and scaling effect for each carousel item based on the scroll position (scrollX).
 * The items will scale down when not in the center and will move slightly to the left or right as they approach the center.
 */
export function useLayoutStackAnimation(data: ItemCarouselProps) {
  // Calculate the input range based on the current index and direction (vertical/horizontal)
  const inputRange = useMemo(() => {
    const currentIndex = data.info.index;
    return [
      (currentIndex - 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // previous item position
      currentIndex * (!data.vertical ? data.itemWidth : data.itemHeight), // current item position
      (currentIndex + 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // next item position
    ];
  }, [data.info.index, data.itemHeight, data.itemWidth, data.vertical]);

  // Animated style that adjusts opacity, scale, and translation based on scroll position
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        data.scrollX.value, // The scroll position value used to interpolate
        inputRange,
        [0.8, 1, 0.8], // Decrease opacity when items are not in the center
        Extrapolation.CLAMP // Prevent extrapolation beyond the defined range
      ),
      transform: [
        {
          scale: interpolate(
            data.scrollX.value,
            inputRange,
            [
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale down inactive items
              1, // Scale to 1 when the item is centered
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale back down when the item is out of focus
            ],
            Extrapolation.CLAMP
          ),
        },
        // Apply horizontal or vertical translation depending on the orientation
        !data.vertical
          ? {
              translateX: interpolate(
                data.scrollX.value,
                inputRange,
                [200, 0, 200], // Move items to the sides when not centered
                Extrapolation.CLAMP
              ),
            }
          : {
              translateY: interpolate(
                data.scrollX.value,
                inputRange,
                [200, 0, 200], // Move items vertically when not centered
                Extrapolation.CLAMP
              ),
            },
      ],
    };
  }, [data.scrollX.value, inputRange]);

  // Return the animated style that will be applied to each item
  return animatedStyle;
}

/**
 * useLayoutDefaultAnimation creates a default animation for carousel items.
 * It interpolates opacity and scaling based on the scroll position (scrollX).
 * The default animation scales the items and adjusts their opacity when scrolling.
 */
export function useLayoutDefaultAnimation(data: ItemCarouselProps) {
  // Calculate the input range based on the current index and direction (vertical/horizontal)
  const inputRange = useMemo(() => {
    const currentIndex = data.info.index;
    return [
      (currentIndex - 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // previous item position
      currentIndex * (!data.vertical ? data.itemWidth : data.itemHeight), // current item position
      (currentIndex + 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // next item position
    ];
  }, [data.info.index, data.itemHeight, data.itemWidth, data.vertical]);

  // Animated style that adjusts opacity and scale for the default animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        data.scrollX.value, // The scroll position value used to interpolate
        inputRange,
        [0.8, 1, 0.8], // Decrease opacity when items are not in the center
        Extrapolation.CLAMP // Prevent extrapolation beyond the defined range
      ),
      transform: [
        {
          scale: interpolate(
            data.scrollX.value,
            inputRange,
            [
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale down inactive items
              1, // Scale to 1 when the item is centered
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale back down when the item is out of focus
            ],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  }, [data.scrollX.value, inputRange]);

  // Return the default animated style
  return animatedStyle;
}

/**
 * useLayoutTinderAnimation creates a Tinder-style animation for carousel items.
 * It includes a combination of opacity, scale, translation (X and Y), and rotation based on the scroll position (scrollX).
 * This creates a dynamic "card-stack" effect with items rotating and translating as they approach or leave the center.
 */
export function useLayoutTinderAnimation(data: ItemCarouselProps) {
  // Calculate the input range based on the current index and direction (vertical/horizontal)
  const inputRange = useMemo(() => {
    const currentIndex = data.info.index;
    return [
      (currentIndex - 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // previous item position
      currentIndex * (!data.vertical ? data.itemWidth : data.itemHeight), // current item position
      (currentIndex + 1) * (!data.vertical ? data.itemWidth : data.itemHeight), // next item position
    ];
  }, [data.info.index, data.itemHeight, data.itemWidth, data.vertical]);

  // Animated style that applies opacity, scale, translation, and rotation for the Tinder-like animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        data.scrollX.value, // The scroll position value used to interpolate
        inputRange,
        [0.8, 1, 0.8], // Decrease opacity when items are not in the center
        Extrapolation.CLAMP // Prevent extrapolation beyond the defined range
      ),
      transform: [
        {
          scale: interpolate(
            data.scrollX.value,
            inputRange,
            [
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale down inactive items
              1, // Scale to 1 when the item is centered
              data.inactiveScale ? data.inactiveScale : 0.8, // Scale back down when the item is out of focus
            ],
            Extrapolation.CLAMP
          ),
        },
        {
          // Horizontal translation for Tinder-style effect
          translateX: interpolate(
            data.scrollX.value,
            inputRange,
            [100, 0, data.itemWidth], // Move the item horizontally for the "stack" effect
            Extrapolation.CLAMP
          ),
        },
        {
          // Vertical translation for Tinder-style effect
          translateY: interpolate(
            data.scrollX.value,
            inputRange,
            [30, 0, 0], // Move the item vertically for the "stack" effect
            Extrapolation.CLAMP
          ),
        },
        {
          // Rotation for Tinder-style effect
          rotate:
            interpolate(
              data.scrollX.value,
              inputRange,
              [22, 0, 0], // Rotate the item as it leaves the center
              Extrapolation.CLAMP
            ) + 'deg', // Apply the degree of rotation
        },
      ],
    };
  }, [data.scrollX.value, inputRange]);

  // Return the animated style that creates the Tinder effect
  return animatedStyle;
}
