import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface ToolButtonProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'accent';
}

const Base = styled.button<{ $variant: 'default' | 'accent' }>`
  font-family: ${fonts.mono};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 12px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${(p) => (p.$variant === 'accent' ? colors.accent : colors.surface2)};
  color: ${(p) => (p.$variant === 'accent' ? colors.bg : colors.textDim)};
  border: 1px solid
    ${(p) => (p.$variant === 'accent' ? colors.accent : colors.border)};
  border-radius: 0;
  cursor: pointer;
  transition:
    color 100ms ease,
    border-color 100ms ease,
    background 100ms ease;

  &:hover:not(:disabled) {
    color: ${(p) => (p.$variant === 'accent' ? colors.bg : colors.text)};
    border-color: ${(p) =>
      p.$variant === 'accent' ? colors.accent : colors.borderHi};
    background: ${(p) =>
      p.$variant === 'accent' ? colors.accent : colors.surface3};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export function ToolButton({
  onClick,
  children,
  disabled,
  title,
  variant = 'default',
}: ToolButtonProps) {
  return (
    <Base
      $variant={variant}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
    >
      {children}
    </Base>
  );
}
