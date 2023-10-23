import React, { useCallback, useEffect, useRef, createRef } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Helper constants
const defaultStyles = {
    selectedMarkBackgroundColor: '#D8D8D8',
    selectedMarkBorderRadius: 8,
    selectedMarkMarginHorizontal: 20,
    itemHeight: 40,
    containerStyle: {},
    countVisibleItems: 4,
    selectedTextStyle: { fontWeight: 'bold', color: '#37474F' },
    unselectedTextStyle: { fontWeight: 'normal', color: '#ADADAD' },
};

const SCROLLER_KEY_PREFIX = {
    top: 'topScroller',
    bottom: 'bottomScroller',
    item: 'item',
};

/**
 * A utility function to create a list of JSX elements based on a component, prefix, and props.
 */
const createScrollElements = (Component, keyPrefix, props, count) =>
    Array.from({ length: count }, (_, index) => (
        <Component key={`${keyPrefix}${index}`} testID={keyPrefix} {...props} />
    ));

/**
 * A spacer component to help with scroll snapping.
 */
export const Scroller = ({ height }) => <View style={{ height }} testID="scrollerView" />;
Scroller.propTypes = {
    height: PropTypes.number.isRequired,
};

/**
 * Component to indicate the currently selected item.
 */
export const SelectedMark = ({
    height,
    position,
    backgroundColor,
    borderRadius,
    marginHorizontal,
}) => (
    <View
        testID="selectedMarkView"
        style={[
            styles.absolute,
            {
                height,
                backgroundColor,
                borderRadius,
                top: position,
                left: marginHorizontal,
                right: marginHorizontal,
            },
        ]}
    />
);
SelectedMark.propTypes = {
    height: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    borderRadius: PropTypes.number.isRequired,
    marginHorizontal: PropTypes.number.isRequired,
};

/**
 * Individual item component in the carousel picker.
 */
export const Item = ({
    onPress,
    content,
    isSelected,
    height,
    textStyle,
    selectedTextStyle,
    unselectedTextStyle,
}) => (
    <TouchableOpacity
        accessibilityLabel={`picker_item:${content}`}
        testID="container-item"
        style={{ height, justifyContent: 'center' }}
        onPress={onPress}
    >
        <Text
            testID="text-item"
            style={[
                styles.defaultTextItem,
                textStyle,
                isSelected ? selectedTextStyle : unselectedTextStyle,
            ]}
        >
            {content}
        </Text>
    </TouchableOpacity>
);
Item.propTypes = {
    onPress: PropTypes.func.isRequired,
    content: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    textStyle: PropTypes.object,
    selectedTextStyle: PropTypes.object,
    unselectedTextStyle: PropTypes.object,
};

/**
 * Main carousel picker component.
 */
const CarouselPicker = ({
    onSelected = () => {},
    backgroundColor = 'white',
    itemTextStyle = {},
    containerStyle = defaultStyles.containerStyle,
    selectedItemTextStyle = defaultStyles.selectedTextStyle,
    unselectedItemTextStyle = defaultStyles.unselectedTextStyle,
    itemHeight = defaultStyles.itemHeight,
    countVisibleItems = defaultStyles.countVisibleItems,
    items = {},
    selectedIndices = {},
    selectedMarkBackgroundColor = defaultStyles.selectedMarkBackgroundColor,
    selectedMarkBorderRadius = defaultStyles.selectedMarkBorderRadius,
    selectedMarkMarginHorizontal = defaultStyles.selectedMarkMarginHorizontal,
    selectedMarkHeight = defaultStyles.itemHeight,
}) => {
    const scrollViewRefs = useRef(
        Object.keys(items).reduce((acc, column) => {
            acc[column] = createRef();
            return acc;
        }, {}),
    );
    const height = itemHeight * countVisibleItems;
    const selectedMarkPosition =
        countVisibleItems % 2 === 0 ? height / 2 : (height - itemHeight) / 2;

    useEffect(() => {
        setTimeout(() => {
            for (let column in items) {
                const ref = scrollViewRefs.current[column];
                if (ref && ref.current) {
                    const position = (selectedIndices[column] || 0) * itemHeight;
                    ref.current.scrollTo({ x: 0, y: position, animated: true });
                }
            }
        }, 0);
    }, []);

    const handleScroll = useCallback(
        (column) => (event) => {
            // Determine the base index based on the scroll position
            const y = event.nativeEvent.contentOffset.y;
            const scrolledItemFraction = y / itemHeight;
            const isPastHalfway = y % itemHeight > itemHeight / 2;
            let index = isPastHalfway
                ? Math.ceil(scrolledItemFraction)
                : Math.floor(scrolledItemFraction);

            // Ensure index is within bounds
            const columnValues = items[column];
            index = Math.max(0, Math.min(index, columnValues.length - 1));

            if (selectedIndices[column] !== index) {
                onSelected(column, index);
            }
        },
        [itemHeight, selectedIndices, onSelected],
    );

    const handleItemPress = useCallback(
        (column, index) => {
            onSelected(column, index);

            // Ensure ScrollView ref exists
            const ref = scrollViewRefs.current[column];
            if (ref && ref.current) {
                const position = index * itemHeight;
                ref.current.scrollTo({ x: 0, y: position, animated: true });
            }
        },
        [onSelected, itemHeight],
    );

    return (
        <View style={[containerStyle, { height, backgroundColor }]} testID="container">
            <SelectedMark
                height={selectedMarkHeight}
                position={selectedMarkPosition}
                backgroundColor={selectedMarkBackgroundColor}
                borderRadius={selectedMarkBorderRadius}
                marginHorizontal={selectedMarkMarginHorizontal}
            />
            <View style={styles.carouselContainer}>
                {Object.entries(items).map(([column, values]) => (
                    <ScrollView
                        key={column}
                        ref={scrollViewRefs.current[column]}
                        testID="scrollView"
                        snapToInterval={itemHeight}
                        onMomentumScrollEnd={handleScroll(column)}
                        showsVerticalScrollIndicator={false}
                        decelerationRate="fast"
                        style={{ flex: 1 }}
                    >
                        {createScrollElements(
                            Scroller,
                            SCROLLER_KEY_PREFIX.top,
                            { height: itemHeight },
                            Math.round(selectedMarkPosition / itemHeight),
                        )}
                        {values.map((content, index) => (
                            <Item
                                key={`${SCROLLER_KEY_PREFIX.item}${index}`}
                                onPress={() => handleItemPress(column, index)}
                                isSelected={index === selectedIndices[column]}
                                height={itemHeight}
                                content={content}
                                textStyle={itemTextStyle}
                                selectedTextStyle={selectedItemTextStyle}
                                unselectedTextStyle={unselectedItemTextStyle}
                            />
                        ))}
                        {createScrollElements(
                            Scroller,
                            SCROLLER_KEY_PREFIX.bottom,
                            { height: itemHeight },
                            countVisibleItems - Math.round(selectedMarkPosition / itemHeight) - 1,
                        )}
                    </ScrollView>
                ))}
            </View>
        </View>
    );
};
CarouselPicker.propTypes = {
    onSelected: PropTypes.func,
    backgroundColor: PropTypes.string,
    itemTextStyle: PropTypes.object,
    containerStyle: PropTypes.object,
    selectedItemTextStyle: PropTypes.object,
    unselectedItemTextStyle: PropTypes.object,
    itemHeight: PropTypes.number,
    countVisibleItems: PropTypes.number,
    items: PropTypes.object.isRequired,
    selectedIndices: PropTypes.object.isRequired,
    selectedMarkBackgroundColor: PropTypes.string,
    selectedMarkBorderRadius: PropTypes.number,
    selectedMarkMarginHorizontal: PropTypes.number,
    selectedMarkHeight: PropTypes.number,
};

const styles = StyleSheet.create({
    defaultTextItem: {
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingHorizontal: 5,
    },
    absolute: {
        position: 'absolute',
    },
    carouselContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        paddingHorizontal: 20,
    },
});

export default CarouselPicker;
