import { IStackItemTokens, IStackStyles, IStackTokens } from '@fluentui/react'

// Soft pink theme colors
const softPinkColors = {
    lightest: '#fdf2f8',
    light: '#fce7f3',
    medium: '#f9a8d4',
    dark: '#ec4899',
    accent: '#be185d'
};

export const rootStackStyles: IStackStyles = {
    root: {
        height: '100vh',
        background: '#FEEBF6'
    }
}

export const headerStackStyles: IStackStyles = {
    root: {
        height: 48,
        background: `linear-gradient(90deg, ${softPinkColors.light}, ${softPinkColors.lightest})`,
        borderBottom: `1px solid #DB8DD0`
    }
}

export const listItemsStackStyles: IStackStyles = {
    root: {
        padding: '10px',
        background: 'transparent'
    }
}

export const mainStackStyles: IStackStyles = {
    root: {
        background: '#FEEBF6'
    }
}

export const sidebarStackStyles: IStackStyles = {
    root: {
        minWidth: 300,
        background: `linear-gradient(180deg, ${softPinkColors.lightest}, ${softPinkColors.light})`,
        borderRight: `1px solid #DB8DD0`,
        boxShadow: `0 4px 8px rgba(236, 72, 153, 0.1)`
    }
}

export const titleStackStyles: IStackStyles = {
    root: {
        alignItems: 'center',
        background: softPinkColors.light,
        borderBottom: `1px solid #DB8DD0`
    }
}

export const stackPadding: IStackTokens = {
    padding: 10
}

export const stackGaps: IStackTokens = {
    childrenGap: 10
}

export const stackItemPadding: IStackItemTokens = {
    padding: 10
}

export const stackItemMargin: IStackItemTokens = {
    margin: 10
}