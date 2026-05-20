import { type ReactNode } from 'react';
import { colors } from '../../theme/tokens';
import { SessionHeader, type SessionMeta } from './SessionHeader';

interface LayoutProps {
  children: ReactNode;
  sessionMeta?: SessionMeta;
}

const Layout = ({ children, sessionMeta }: LayoutProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
      }}
    >
      <SessionHeader meta={sessionMeta} />
      <main
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          background: colors.bg,
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
