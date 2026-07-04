import React from 'react';


const AuthLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">OG</span>
          </div>
          <h1 className="text-2xl font-bold">Otaku Gildija</h1>
          <p className="text-gray-400 mt-2">Manage your anime library with ease</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
