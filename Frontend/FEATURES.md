# Portfolio App - Complete Feature Guide

## Overview
A modern portfolio management application with vibrant OLED-friendly theming, real-time market data, and advanced analytics.

## 1. Theme System

### Vibrant Black (OLED) Theme (Default)
- **Background**: Pure black (`#000000`) for OLED screens
- **Text**: White (`#ffffff`) primary, zinc-400 secondary
- **Glass Effects**: Subtle transparency with backdrop blur
- **Borders**: Zinc-800 for clear separation

### High Contrast Light Mode
- **Background**: Pure white (`#ffffff`)
- **Text**: Zinc-950 for maximum readability
- **Borders**: Zinc-200 for clear definition
- **Glass**: High opacity for better contrast

**Implementation**: CSS variables in `src/index.css` controlled by `.light-mode` class

## 2. Pages

### Explore Page (`src/pages/ExplorePage.jsx`)
**Features**:
- **My Investments Ribbon**: Horizontal scroll of current holdings
- **Trending Stocks**: Grid of top performing stocks
- **Market Pulse**: Live indices, top movers, volatility
- **News Section**: Latest market news
- **Mutual Funds**: Top performing funds

**Note**: Market Sect ors section removed as per user request

### Holdings Page (`src/pages/HoldingsPage.jsx`)
**Features**:
- **Hero Value Display**: Large portfolio total with today's P&L
- **Quick Stats Grid**: Total P&L, Invested Amount, Alpha, Stock Count
- **Performance Chart**: 7-day portfolio value trend
- **Holdings List**: Detailed view with sparklines for each stock
- **Asset Allocation**: Donut chart with sector breakdown
- **Portfolio Analysis**: Diversification score, Beta, ratios
  
**Enhancements**:
- Animated entry effects
- Glass morphism cards
- Interactive hover states

### Stock Detail Page (`src/pages/StockDetailPage.jsx`)
- Live price charts (1D, 1W, 1M, 1Y)
- Order placement (Buy/Sell)
- Tabs: Overview, Technicals, News, Financials
- Peer comparison

## 3. Components

### TwistCard (`src/components/TwistCard.jsx`)
**Purpose**: 3D perspective effect on mouse movement
**Usage**: Wraps investment/stock cards for subtle interactivity
**Tech**: Framer Motion springs for smooth physics-based animation

### Navigation (`src/components/Navigation.jsx`)
- Theme toggle (Dark/Light)
- Search bar
- Main navigation links
- User profile

### Market Pulse (`src/components/MarketPulse.jsx`)
- Real-time indices (SENSEX, DOW, NASDAQ)
- Top gainers/losers
- Volume leaders

## 4. Data Structure

### Mock Data (`src/data/mockData.js`)
Exports:
- `indices`: Market indices with sparklines
- `holdings`: User portfolio stocks
- `portfolioSummary`: Aggregate metrics
- `topMovers`: Gainers/losers/volume
- `sectors`: Sector performance
- `news`: Market news feed

## 5. Styling

### Glass Morphism
- `.glass-card`: Standard glass effect
- Backdrop blur combined with subtle transparency
- Works in both dark and light modes

### Color System
- **Emerald**: Positive values (#10b981)
- **Coral/Red**: Negative values (#f87171)
- **Violet**: Brand accent (#7c3aed)
- **Cyan**: Highlights (#06b6d4)

## 6. Animations

### Framer Motion Patterns
- **Page transitions**: Opacity fade-in
- **Stagger effects**: Sequential card reveals
- **Hover states**: Scale, translate, glow effects
- **Scroll animations**: Parallax on Holdings hero

## 7. Technical Stack
- **React**: UI framework
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library
- **Recharts**: Data visualization
- **React Router**: Navigation
- **Lucide React**: Icon library

## 8. Best Practices
- Semantic color variables for easy theming
- Responsive grid layouts (mobile-first)
- Accessible contrast ratios in light mode
- Performance optimized with lazy loading
- Consistent spacing scale (4px base)
