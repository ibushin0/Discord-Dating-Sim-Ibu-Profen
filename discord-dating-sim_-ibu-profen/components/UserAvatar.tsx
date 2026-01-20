
import React from 'react';

interface UserAvatarProps {
  src: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, status = 'online', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20'
  };

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      <img src={src} alt="Avatar" className="rounded-full w-full h-full object-cover" />
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${statusColors[status]}`} />
    </div>
  );
};
