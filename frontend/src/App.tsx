import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { PostEditorModal } from './components/blog/PostEditorModal';
import { Home } from './pages/Home';
import { PostDetail } from './pages/PostDetail';
import { Blog } from './types';

export const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [latestCreatedBlog, setLatestCreatedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-100 dark:bg-stone-950 dark:text-stone-100">
          <Navbar
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenNewPost={() => setIsNewPostOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    onNotify={notify}
                    newBlogCreated={latestCreatedBlog}
                    searchQuery={searchQuery}
                  />
                }
              />
              <Route path="/blog/:id" element={<PostDetail onNotify={notify} />} />
            </Routes>
          </main>

          <Footer />

          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onNotify={notify}
          />

          <PostEditorModal
            isOpen={isNewPostOpen}
            onClose={() => setIsNewPostOpen(false)}
            onCreated={(blog) => setLatestCreatedBlog(blog)}
            onNotify={notify}
          />

          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
