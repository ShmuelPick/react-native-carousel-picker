import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 *
 */
export const Item = ({
  onPress,
  backgroundColor,
  isSelected,
  content,
  height,
  textStyle,
  selectedTextStyle,
  unselectedTextStyle,
}) => {
    const touchableAccessibilityLabel = `picker_item:` + content;
    const selectedStateStyle = isSelected
        ? selectedTextStyle
        : unselectedTextStyle;
    return (
        <TouchableOpacity
            accessibilityLabel={touchableAccessibilityLabel}
            testID={"container-item"}
            style={{ height, backgroundColor, justifyContent: "center" }}
            onPress={onPress}
        >
            <Text
                testID={"text-item"}
                style={[styles.defaultTextItem, textStyle, selectedStateStyle]}
            >
                {content}
            </Text>
        </TouchableOpacity>
    );
};

/**
 *
 */
export const SelectedMark = ({
  height,
  position,
  backgroundColor,
  borderRadius,
  marginHorizontal,
}) => {
    const selectedMarkStyle = {
        height,
        backgroundColor,
        borderRadius,
        top: position,
        left: marginHorizontal,
        right: marginHorizontal,
    };

    return (
        <View
            testID={"selectedMarkView"}
            style={[styles.absolute, selectedMarkStyle]}
        />
    );
};

/**
 * A group of default values to simplify the use of the picker
 */
export const defaultSelectedMarkBackgroundColor = "#D8D8D8";
export const defaultSelectedMarkBorderRadius = 8;
export const defaultMarginHorizontal = 20;
export const defaultItemHeight = 40;
export const defaultCountVisibleItems = 4;
export const defaultSelectedMarkHeight = defaultItemHeight;
export const defaultSelectedTextStyle = {
    fontWeight: "bold",
    color: "#37474F",
};
export const defaultUnselectedTextStyle = {
    fontWeight: "normal",
    color: "#ADADAD",
};

/**
 * A scroller is an empty component that enable to activate scroll
 */
export const Scroller = ({ height }) => {
    return <View style={{ height }} testID={"scrollerView"} />;
};
/**
 * Define a unique key for each scroll child
 * @param {*} ComponentClass The component we want to render
 * @param {*} keyPrefix The key prefix that will be combined with index of rendered the scroll child
 */
const mapScrollChild = (ComponentClass, keyPrefix) => (props) => (index) => (
    <ComponentClass key={`${keyPrefix}${index}`} testID={keyPrefix} {...props} />
);
const defaultRenderTopSpaceScroller = mapScrollChild(Scroller, "topScroller");
const defaultRenderBottomSpaceScroller = mapScrollChild(
    Scroller,
    "bottomScroller",
);
const defaultRenderVisibleItemAtIndex = mapScrollChild(Item, "item");

const getSelectedMarkPosition = (countVisibleItems, height, itemHeight) => {
    const hasEvenVisibleItems = countVisibleItems % 2 === 0;
    return hasEvenVisibleItems ? height / 2 : (height + itemHeight) / 2;
};
const getVisibleHeight = (itemHeight, countVisibleItems) =>
    itemHeight * countVisibleItems;

/**
 *
 */
const CarouselPicker = ({
  onSelected = () => {},
  backgroundColor,
  itemTextStyle,
  selectedItemTextStyle = defaultSelectedTextStyle,
  unselectedItemTextStyle = defaultUnselectedTextStyle,
  renderTopSpaceScroller = defaultRenderTopSpaceScroller,
  renderBottomSpaceScroller = defaultRenderBottomSpaceScroller,
  renderVisibleItemAtIndex = defaultRenderVisibleItemAtIndex,
  itemHeight = defaultItemHeight,
  countVisibleItems = defaultCountVisibleItems,
  items = [],
  selectedIndex = 0,
  SelectedMarkBackgroundColor = defaultSelectedMarkBackgroundColor,
  SelectedMarkBorderRadius = defaultSelectedMarkBorderRadius,
  SelectedMarkMarginHorizontal = defaultMarginHorizontal,
  SelectedMarkHeight = defaultSelectedMarkHeight,
}) => {
    const [scrollPosition, setScrollPosition] = useState(
        selectedIndex * itemHeight,
    );
    const [isStartDragingScroll, setIsStartDragingScroll] = useState(false);
    const height = getVisibleHeight(itemHeight, countVisibleItems);
    const SelectedMarkPosition = getSelectedMarkPosition(
        countVisibleItems,
        height,
        itemHeight,
    );
    const countTopScrollers = Math.trunc(SelectedMarkPosition / itemHeight);
    const countBottomScrollers = countVisibleItems - (countTopScrollers + 1);

    let scrollViewRef = useRef(null);

    useEffect(() => {
        if (!isStartDragingScroll) {
            const position = selectedIndex * itemHeight;
            scrollViewRef.current.scrollTo({ x: 0, y: position, animated: true });
        }
    }, [selectedIndex, isStartDragingScroll]);

    const doScroll = useCallback(
        ({ nativeEvent }) => {
            const position = nativeEvent.contentOffset.y;
            setScrollPosition(position);
        },
        [itemHeight],
    );

    const doStartDragScroll = useCallback(() => {
        setIsStartDragingScroll(true);
    }, []);

    const doEndDragScroll = useCallback(() => {
        let index = Math.round(scrollPosition / itemHeight);

        if (index >= items.length) {
            index = items.length - 1;
        } else if (index < 0) {
            index = 0;
        }

        onSelected(index);
        setIsStartDragingScroll(false);
    }, [itemHeight, scrollPosition]);

    return (
        <View style={{ height, backgroundColor }} testID={"container"}>
            <SelectedMark
                testID={"topSelectedMark"}
                height={SelectedMarkHeight}
                position={SelectedMarkPosition}
                backgroundColor={SelectedMarkBackgroundColor}
                borderRadius={SelectedMarkBorderRadius}
                marginHorizontal={SelectedMarkMarginHorizontal}
            />
            <ScrollView
                ref={scrollViewRef}
                testID={"scrollView"}
                snapToInterval={itemHeight}
                snapToStart={false}
                onScrollBeginDrag={doStartDragScroll}
                onScrollEndDrag={doEndDragScroll}
                onScroll={doScroll}
                snapToAlignment={undefined}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                decelerationRate={"fast"}
            >
                {[...Array(countTopScrollers).keys()].map(
                    renderTopSpaceScroller({ height: itemHeight }),
                )}
                {items.map((content, index) =>
                    renderVisibleItemAtIndex({
                        onPress: () => onSelected(index),
                        isSelected: index === selectedIndex,
                        height: itemHeight,
                        content,
                        textStyle: itemTextStyle,
                        selectedTextStyle: selectedItemTextStyle,
                        unselectedTextStyle: unselectedItemTextStyle,
                    })(index),
                )}
                {[...Array(countBottomScrollers).keys()].map(
                    renderBottomSpaceScroller({ height: itemHeight }),
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    defaultTextItem: {
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    absolute: {
        position: 'absolute',
    },
});

export default CarouselPicker;
