import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { styles } from './style';

interface PaginationProps {
  dataLength: number;
  currentIndex: number;
  paginationStyle?: {
    container?: StyleProp<ViewStyle>;
    bullet?: StyleProp<ViewStyle>;
    activeBullet?: StyleProp<ViewStyle>;
  };
}

const Pagination: React.FC<PaginationProps> = ({
  dataLength,
  currentIndex,
  paginationStyle,
}) => {
  return (
    <View style={[styles.paginationContainer, paginationStyle?.container]}>
      {Array.from({ length: dataLength }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.bullet,
            paginationStyle?.bullet,
            index === currentIndex && [
              styles.activeBullet,
              paginationStyle?.activeBullet,
            ],
          ]}
        />
      ))}
    </View>
  );
};

export default Pagination;
