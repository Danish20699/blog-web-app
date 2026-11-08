import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-stone-200 py-10 dark:border-stone-800 bg-white dark:bg-stone-900/50">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between px-4 font-mono text-xs text-stone-500 sm:px-6 gap-4">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-[10px] font-black text-white dark:bg-white dark:text-black">
            DEV
          </span>
          <span className="font-bold text-stone-900 dark:text-stone-100">DEVSPACE.</span>
          <span>— The community for modern software builders</span>
        </div>
        <span>© {new Date().getFullYear()} DEVSPACE Community. All rights reserved.</span>
      </div>
    </footer>
  );
};
