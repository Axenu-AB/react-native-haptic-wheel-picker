import React, {useState} from 'react';
import {StyleSheet, Text, TextStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

interface PickerItemProps<T> {
  item: T;
  index: number;
  translateY: {value: number};
  itemHeight: number;
  textStyle?: TextStyle;
  renderItem?: (item: T) => JSX.Element;
  itemDistanceMultipier: number;
  wheelHeightMultiplier: number;
}

const calcValue = (
  translateY: number,
  offset: number,
  itemHeight: number,
  itemDistanceMultipier: number,
) => {
  'worklet';

  return Math.sin(
    Math.max(
      Math.min(
        (translateY + offset) / (itemHeight / itemDistanceMultipier),
        Math.PI * 0.5,
      ),
      -Math.PI * 0.5,
    ),
  );
};

const PickerItem = <T,>({
  item,
  index,
  translateY,
  itemHeight,
  textStyle,
  renderItem,
  itemDistanceMultipier,
  wheelHeightMultiplier,
}: PickerItemProps<T>) => {
  const [width, setWidth] = useState(0);
  const offset = index * itemHeight;
  const value = useDerivedValue(() =>
    calcValue(translateY.value, offset, itemHeight, itemDistanceMultipier),
  );

  const animatedStyleWheelTranslation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: value.value * itemHeight * wheelHeightMultiplier,
        },
      ],
      opacity: 1 - Math.abs(value.value),
      height: itemHeight,
    };
  });

  const animatedStyleScaling = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scaleY: 1 - Math.abs(value.value),
        },
      ],
    };
  });

  return (
    <Animated.View
      onLayout={(event) => {
        if (event.nativeEvent.layout.width > width) {
          setWidth(event.nativeEvent.layout.width);
        }
      }}
      style={[styles.item, animatedStyleWheelTranslation]}>
      <Animated.View style={[styles.itemInner, animatedStyleScaling]}>
        {renderItem ? (
          renderItem(item)
        ) : (
          <Text style={[styles.itemText, textStyle]}>{`${item}`}</Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

PickerItem.defaultProps = {
  renderItem: undefined,
  textStyle: undefined,
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  itemInner: {
    width: '100%',
  },
  itemText: {
    color: 'white',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});

export default PickerItem;
