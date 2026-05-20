import { type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';
import { Label } from './Label';
import { Mono } from './Mono';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        padding: '4px 4px 0',
      }}
    >
      <div>
        {eyebrow && <Label size="micro">{eyebrow}</Label>}
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: 28,
            fontWeight: 600,
            color: colors.text,
            marginTop: eyebrow ? 4 : 0,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <Mono
            style={{
              color: colors.textMute,
              fontSize: 11,
              marginTop: 4,
              letterSpacing: '0.4px',
            }}
          >
            {subtitle}
          </Mono>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>
      )}
    </div>
  );
}
