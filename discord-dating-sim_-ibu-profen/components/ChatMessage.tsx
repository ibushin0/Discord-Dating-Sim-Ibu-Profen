
import React from 'react';
import { Message } from '../types';
import { UserAvatar } from './UserAvatar';
import { USER_AVATAR } from '../constants';

interface ChatMessageProps {
  message: Message;
  profenAvatar: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, profenAvatar }) => {
  if (message.sender === 'system') {
    return (
      <div className="flex items-center my-4 px-4">
        <div className="flex-1 h-[1px] bg-[#3f4147]"></div>
        <div className="mx-4 text-xs font-bold text-[#949ba4] uppercase tracking-wider">
          {message.content}
        </div>
        <div className="flex-1 h-[1px] bg-[#3f4147]"></div>
      </div>
    );
  }

  const isProfen = message.sender === 'profen';
  const name = isProfen ? '伊武ﾌﾟﾛﾌｪﾝ' : '俺';
  const nameColor = isProfen ? 'text-[#ff73fa]' : 'text-white';

  if (message.isError) {
    return (
      <div className="flex px-4 py-2 hover:bg-[#2e3035] group animate-in fade-in slide-in-from-left-2 duration-300">
         <div className="text-[#f23f42] text-sm py-1 border-l-4 border-[#f23f42] pl-4 italic">
           メッセージを送信できませんでした。このユーザーにブロックされています。
         </div>
      </div>
    );
  }

  return (
    <div className="flex px-4 py-2 hover:bg-[#2e3035] group animate-in fade-in duration-300">
      <UserAvatar src={isProfen ? profenAvatar : USER_AVATAR} />
      <div className="ml-4 flex-1">
        <div className="flex items-baseline">
          <span className={`font-semibold hover:underline cursor-pointer ${nameColor}`}>{name}</span>
          <span className="ml-2 text-xs text-[#949ba4] font-medium">{message.timestamp}</span>
        </div>
        <div className="text-[#dbdee1] whitespace-pre-wrap leading-6">{message.content}</div>
        {message.image && (
          <div className="mt-2 rounded-lg overflow-hidden max-w-sm border border-[#1e1f22] bg-[#2b2d31] min-h-[200px] flex items-center justify-center">
            <img 
              src={message.image} 
              alt="Sent file" 
              className="w-full h-auto object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559466273-d95e72debaf8?w=800&q=80';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
