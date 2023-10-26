declare module 'react-native-carousel-picker' {
    import { ComponentType } from 'react';
    import { StyleProp, ViewStyle, TextStyle } from 'react-native';

    export type ScrollerProps = {
        height: number;
    };

    export type SelectedMarkProps = {
        height: number;
        position: number;
        backgroundColor: string;
        borderRadius: number;
        marginHorizontal: number;
    };

    export type ItemProps = {
        onPress: () => void;
        content: string;
        isSelected: boolean;
        height: number;
        textStyle?: StyleProp<TextStyle>;
        selectedTextStyle?: StyleProp<TextStyle>;
        unselectedTextStyle?: StyleProp<TextStyle>;
    };

    export type CarouselPickerProps = {
        onSelected?: (column: string, index: number) => void;
        backgroundColor?: string;
        itemTextStyle?: StyleProp<TextStyle>;
        containerStyle?: StyleProp<ViewStyle>;
        selectedItemTextStyle?: StyleProp<TextStyle>;
        unselectedItemTextStyle?: StyleProp<TextStyle>;
        itemHeight?: number;
        countVisibleItems?: number;
        items: Record<string, string[]>;
        selectedIndices: Record<string, number>;
        selectedMarkBackgroundColor?: string;
        selectedMarkBorderRadius?: number;
        selectedMarkMarginHorizontal?: number;
        selectedMarkHeight?: number;
    };

    export const Scroller: ComponentType<ScrollerProps>;
    export const SelectedMark: ComponentType<SelectedMarkProps>;
    export const Item: ComponentType<ItemProps>;
    export const CarouselPicker: ComponentType<CarouselPickerProps>;
}
