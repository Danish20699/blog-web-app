import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenNewPost: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenNewPost,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="group flex items-center space-x-2">
            <span className="flex h-8 items-center justify-center rounded bg-black px-2.5 font-mono text-sm font-black tracking-wider text-white shadow-sm transition-transform group-hover:scale-105 dark:bg-white dark:text-black">
              DEV
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100">
                SPACE<span className="text-indigo-600 dark:text-indigo-400">.</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase -mt-1">
                Community & Code
              </span>
            </div>
          </Link>

          {/* Search Box */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search posts, tags, or authors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-72 rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Auth / Action CTA */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenNewPost}
                className="inline-flex items-center space-x-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <span>+</span>
                <span>Create Post</span>
              </button>

              <div className="flex items-center space-x-2.5 border-l border-stone-200 pl-3 dark:border-stone-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 font-mono text-xs font-bold text-white dark:bg-stone-100 dark:text-stone-900">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {user?.name}
                  </span>
                  <span className="font-mono text-[10px] text-stone-400">
                    @{user?.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="rounded px-1.5 py-0.5 text-xs text-stone-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenAuth}
                className="rounded-md border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:border-stone-900 hover:text-black dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-400"
              >
                Log in
              </button>
              <button
                onClick={onOpenAuth}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
