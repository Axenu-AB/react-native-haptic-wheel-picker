import React from 'react';
import {StyleSheet, TextStyle, View} from 'react-native';
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
  options: T[];
  defaultValue?: T;
  onValueChange: (Value: T) => void;
  textStyle?: TextStyle;
  renderItem?: (item: T) => JSX.Element;
  keyExtractor?: (item: T) => string;
  itemHeight?: number;
  itemDistanceMultipier?: number;
  wheelHeightMultiplier?: number;
};

type AnimatedGHContext = {
  startY: number;
};

const Picker = <T,>(
  {
    options,defaultValue,
    onValueChange,
    textStyle,
    renderItem,
    keyExtractor,
    itemHeight=ITEM_HEIGHT,
    itemDistanceMultipier=ITEM_DISTANCE,
    wheelHeightMultiplier=WHEEL_HEIGHT_MULTIPLIER
  }: PickerProps<T>) => {
  let index = options.findIndex((item) => item === defaultValue);
  index = index === -1 ? 0 : index;
  
  const optionsIndex = useSharedValue(index);
  const translateY = useSharedValue(optionsIndex.value * -itemHeight);
  const lastIndexY = useSharedValue(index * -itemHeight);
  const maximum = (options.length - 1) * -itemHeight;

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
          runOnJS(onValueChange)(
            options[Math.round(translateY.value / -itemHeight)],
          );
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
          {options.map((item, listIndex) => (
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
          <View style={style.selector} />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const style =
  StyleSheet.create({
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
