import React from 'react';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import PickerItem from './PickerItem';

const ITEM_HEIGHT = 40;
const ITEM_DISTANCE = 0.285;
const WHEEL_HEIGHT_MULTIPLIER = 2.6;

export const SPRING_CONFIG = {
  damping: 40,
  mass: 1,
  stiffness: 500,
  overshootClamping: true,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

interface PickerProps<T> {
  /**
   * list of items to be displayed
   */
  data: T[];
  /**
   * default item to be selected
   * @default data[0]
   */
  defaultItem?: T;
  /**
   * callback function to be called when item changes
   */
  onItemSelect?: (Value: T) => void;
  /**
   * style for text
   * @default {color: 'white', paddingHorizontal: 16, textAlign: 'center'}
   */
  textStyle?: TextStyle;
  /**
   * custom render function for item
   * @default (item) => <Text>{item}</Text>
   */
  renderItem?: (item: T) => JSX.Element;
  /**
   * custom key extractor function
   */
  keyExtractor?: (item: T) => string;
  /**
   * height of each item
   * @default 40
   */
  itemHeight?: number;
  /**
   * multiplier for distance between items
   * @default 0.285
   */
  itemDistanceMultipier?: number;
  /**
   * multiplier for wheel height
   * @default 2.6
   */
  wheelHeightMultiplier?: number;
  /**
   * style for selector lines
   * @default {borderBottomWidth: 1, borderTopWidth: 1, borderColor: 'black'}
   */
  selectorStyle?: ViewStyle;
}

type AnimatedGHContext = {
  startY: number;
};

const Picker = <T,>({
  data,
  defaultItem,
  onItemSelect,
  textStyle,
  renderItem,
  keyExtractor,
  itemHeight = ITEM_HEIGHT,
  itemDistanceMultipier = ITEM_DISTANCE,
  wheelHeightMultiplier = WHEEL_HEIGHT_MULTIPLIER,
  selectorStyle,
}: PickerProps<T>) => {
  let index = data.findIndex((item) => item === defaultItem);
  index = index === -1 ? 0 : index;

  const optionsIndex = useSharedValue(index);
  const translateY = useSharedValue(optionsIndex.value * -itemHeight);
  const lastIndexY = useSharedValue(index * -itemHeight);
  const maximum = (data.length - 1) * -itemHeight;

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    AnimatedGHContext
  >({
    onStart: (_, ctx) => {
      ctx.startY = optionsIndex.value * -ITEM_HEIGHT;
    },
    onActive: (event, ctx) => {
      translateY.value = Math.min(
        Math.max(ctx.startY + event.translationY, maximum),
        0,
      );
      if (
        translateY.value > lastIndexY.value + itemHeight ||
        translateY.value < lastIndexY.value - itemHeight
      ) {
        lastIndexY.value =
          Math.round(translateY.value / -itemHeight) * -itemHeight;
        runOnJS(ReactNativeHapticFeedback.trigger)('impactLight');
      }
    },
    onEnd: (event) => {
      optionsIndex.value = Math.round(translateY.value / -itemHeight);

      translateY.value = withDecay(
        {
          velocity: event.velocityY,
          deceleration: 0.985,
          clamp: [maximum, 0],
        },
        () => {
          if (onItemSelect) {
            runOnJS(onItemSelect)(
              data[Math.round(translateY.value / -itemHeight)],
            );
          }
          optionsIndex.value = Math.round(translateY.value / -itemHeight);
          translateY.value = withSpring(
            optionsIndex.value * -itemHeight,
            SPRING_CONFIG,
          );
        },
      );
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={style.picker}>
        <View style={style.picker__offset}>
          {data.map((item, listIndex) => (
            <PickerItem
              key={keyExtractor ? keyExtractor(item) : listIndex}
              item={item}
              index={listIndex}
              translateY={translateY}
              itemHeight={ITEM_HEIGHT}
              textStyle={textStyle}
              renderItem={renderItem}
              itemDistanceMultipier={itemDistanceMultipier}
              wheelHeightMultiplier={wheelHeightMultiplier}
            />
          ))}
          <View style={[style.selector, selectorStyle]} />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

Picker.defaultProps = {
  defaultItem: undefined,
  onItemSelect: undefined,
  keyExtractor: undefined,
  renderItem: undefined,
  textStyle: undefined,
  itemHeight: ITEM_HEIGHT,
  itemDistanceMultipier: ITEM_DISTANCE,
  wheelHeightMultiplier: WHEEL_HEIGHT_MULTIPLIER,
  selectorStyle: undefined,
};

const style = StyleSheet.create({
  picker: {
    flexDirection: 'column',
    height: ITEM_HEIGHT * 5,
  },
  picker__offset: {
    top: ITEM_HEIGHT * 2,
  },
  selector: {
    borderBottomWidth: 1,
    borderColor: 'white',
    borderTopWidth: 1,
    height: ITEM_HEIGHT,
  },
});

export default Picker;
