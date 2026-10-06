// Shared design system for LibroSeat — the React Native equivalent of our
// Figma style page. Keep this the ONE place colors/spacing are defined so
// every member's screens look consistent when merged.
// Please don't edit without telling the group first.

export const colors = {
  primary: '#14919B', // calm blue/teal accent
  background: '#F7F8FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  border: '#E3E6EA',
  success: '#2E7D32',
  danger: '#D64545',
  warning: '#F4A300',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const typography = {
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted },
};
