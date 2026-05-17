// src/utils/responsive.js
import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  desktop: 1024,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;

  // Grid columns
  const numColumns = isDesktop ? 4 : isTablet ? 2 : 1;
  // Card columns for product grid
  const productColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  // Font scales
  const fontScale = isDesktop ? 1.2 : isTablet ? 1.1 : 1;
  const fontSize = {
    xs: Math.round(10 * fontScale),
    sm: Math.round(12 * fontScale),
    base: Math.round(14 * fontScale),
    lg: Math.round(16 * fontScale),
    xl: Math.round(18 * fontScale),
    '2xl': Math.round(22 * fontScale),
    '3xl': Math.round(28 * fontScale),
    '4xl': Math.round(34 * fontScale),
  };

  // Spacing scale
  const spacing = {
    xs: isDesktop ? 8 : isTablet ? 6 : 4,
    sm: isDesktop ? 12 : isTablet ? 10 : 8,
    md: isDesktop ? 20 : isTablet ? 16 : 12,
    lg: isDesktop ? 28 : isTablet ? 24 : 16,
    xl: isDesktop ? 40 : isTablet ? 32 : 24,
  };

  // Container max width
  const containerWidth = isDesktop
    ? Math.min(width * 0.85, 1200)
    : isTablet
    ? Math.min(width * 0.92, 800)
    : width;

  // Button height
  const btnHeight = isDesktop ? 56 : isTablet ? 52 : 48;

  // Input height
  const inputHeight = isDesktop ? 54 : isTablet ? 50 : 48;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    numColumns,
    productColumns,
    fontScale,
    fontSize,
    spacing,
    containerWidth,
    btnHeight,
    inputHeight,
  };
}
