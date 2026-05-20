import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface PillProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
}

const Base = styled.button<{ $active?: boolean }>`
  font-family: ${fonts.mono};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 4px 10px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${(p) => (p.$active ? 'rgba(62, 197, 209, 0.12)' : 'transparent')};
  color: ${(p) => (p.$active ? colors.accent : colors.textDim)};
  border: 1px solid ${(p) => (p.$active ? colors.accent : colors.border)};
  border-radius: 0;
  cursor: pointer;
  transition:
    color 100ms ease,
    border-color 100ms ease,
    background 100ms ease;

  &:hover:not(:disabled) {
    color: ${colors.text};
    border-color: ${(p) => (p.$active ? colors.accent : colors.borderHi)};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export function Pill({ active, onClick, children, disabled, title }: PillProps) {
  return (
    <Base
      $active={active}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
    >
      {children}
    </Base>
  );
}
