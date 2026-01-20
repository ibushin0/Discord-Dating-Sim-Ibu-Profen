
import React from 'react';
import { USER_AVATAR } from '../constants';

export const Sidebar: React.FC = () => {
  const channels = ['雑談', 'ゲーム', '酒カス-部', '作業用', 'システム開発'];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Server Rail */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2 flex-shrink-0">
        <div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:rounded-xl transition-all duration-200">
          D
        </div>
        <div className="w-8 h-[2px] bg-[#35363c] rounded-full mx-auto my-1" />
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center text-[#dbdee1] font-bold text-xl cursor-pointer hover:rounded-xl hover:bg-[#23a559] hover:text-white transition-all duration-200">
          P
        </div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center text-[#23a559] font-bold text-xl cursor-pointer hover:rounded-xl hover:bg-[#23a559] hover:text-white transition-all duration-200">
          +
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
        <div className="h-12 border-b border-[#1e1f22] flex items-center px-4 font-bold shadow-sm hover:bg-[#35373c] cursor-pointer text-white">
          Profen's Lab
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-2 mb-4">
            <div className="text-xs font-bold text-[#949ba4] uppercase px-2 mb-2">テキストチャンネル</div>
            {channels.map((ch, idx) => (
              <div 
                key={ch} 
                className={`flex items-center px-2 py-1.5 rounded cursor-pointer group mb-0.5 ${idx === 0 ? 'bg-[#3f4147] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <span className="text-[#80848e] text-xl font-light mr-1.5">#</span>
                <span className="font-medium">{ch}</span>
              </div>
            ))}
          </div>
        </div>
        {/* User Info Section */}
        <div className="h-[52px] bg-[#232428] flex items-center px-2">
           <div className="flex items-center w-full p-1 rounded hover:bg-[#35373c] cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#313338] flex items-center justify-center text-white text-xs font-bold mr-2 overflow-hidden border border-[#1e1f22]">
                <img src={USER_AVATAR} alt="me" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-white leading-none truncate">俺</div>
                <div className="text-[10px] text-[#b5bac1] leading-none truncate mt-0.5">オンライン</div>
              </div>
              <div className="flex text-[#b5bac1] space-x-1 group-hover:text-white">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm0 13.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
