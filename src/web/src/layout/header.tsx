import { FontIcon, IconButton, IIconProps, IStackStyles, mergeStyles, Persona, PersonaSize, Stack, Text } from '@fluentui/react';
import { FC, ReactElement } from 'react';

// Soft pink theme colors
const softPinkColors = {
    lightest: '#fdf2f8',
    light: '#fce7f3',
    medium: '#f9a8d4',
    dark: '#ec4899',
    accent: '#be185d',
    lightPurple: '#e879f9',
    lightPurpleDark: '#c026d3'
};

const logoStyles: IStackStyles = {
    root: {
        width: '300px',
        background: `linear-gradient(90deg, ${softPinkColors.light}, ${softPinkColors.lightest})`,
        alignItems: 'center',
        padding: '0 20px',
        borderRight: `1px solid ${softPinkColors.medium}`
    }
}

const logoIconClass = mergeStyles({
    fontSize: 20,
    paddingRight: 10,
    color: softPinkColors.lightPurpleDark
});

const toolStackClass: IStackStyles = {
    root: {
        alignItems: 'center',
        height: 48,
        paddingRight: 10,
        background: 'transparent'
    }
}

const iconProps: IIconProps = {
    styles: {
        root: {
            fontSize: 16,
            color: softPinkColors.lightPurpleDark
        }
    }
}

const Header: FC = (): ReactElement => {
    return (
        <Stack horizontal>
            <Stack horizontal styles={logoStyles}>
                <FontIcon aria-label="Check" iconName="SkypeCircleCheck" className={logoIconClass} />
                <Text variant="xLarge" style={{ color: softPinkColors.lightPurpleDark, fontWeight: '600' }}>smarino cheklist</Text>
            </Stack>
            <Stack.Item grow={1}>
                <div></div>
            </Stack.Item>
            <Stack.Item>
                <Stack horizontal styles={toolStackClass} grow={1}>
                    <IconButton aria-label="Add" iconProps={{ iconName: "Settings", ...iconProps }} />
                    <IconButton aria-label="Add" iconProps={{ iconName: "Help", ...iconProps }} />
                    <Persona size={PersonaSize.size24} text="Sample User" />
                    {/* <Toggle label="Dark Mode" inlineLabel styles={{ root: { marginBottom: 0 } }} onChange={changeTheme} /> */}
                </Stack>
            </Stack.Item>
        </Stack>
    );
}

export default Header;