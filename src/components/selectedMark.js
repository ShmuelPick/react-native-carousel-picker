import React from "react";
import { View, StyleSheet } from "react-native";

/**
 *
 */
const SelectedMark = ({
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

const styles = StyleSheet.create({
    absolute: {
        position: 'absolute',
    },
});

export default SelectedMark;
