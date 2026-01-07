import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '../common/Toast';
import { useToast } from '../../hooks/useToast';
import { ChatWidget } from '../chat/ChatWidget';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ChatWidget />
    </div>
  );
};
