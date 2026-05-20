import { type CSSProperties, type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface PanelProps {
  title?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
  padding?: number | string;
  live?: boolean;
}

export function Panel({
  title,
  right,
  children,
  style,
  bodyStyle,
  padding = 16,
  live,
}: PanelProps) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
      }}
    >
      {title !== undefined && (
        <div
          style={{
            padding: '8px 14px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: colors.textDim,
            height: 32,
            flexShrink: 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {live && (
              <span
                className="apex-live"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: colors.accent,
                  display: 'inline-block',
                }}
              />
            )}
            {title}
          </span>
          {right}
        </div>
      )}
      <div
        style={{
          padding,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
