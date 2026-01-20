
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { Message, GameStatus, Choice } from './types';
import { GAME_ROUNDS, PROFEN_AVATAR, ROUND_6A, ROUND_6B } from './constants';

const BLACK_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START);
  const [gameBranch, setGameBranch] = useState<'6A' | '6B' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [socialEndingText, setSocialEndingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Refs
  const soundReceive = useRef<HTMLAudioElement | null>(null);
  const soundSend = useRef<HTMLAudioElement | null>(null);
  const soundStartup = useRef<HTMLAudioElement | null>(null);
  const soundWon = useRef<HTMLAudioElement | null>(null);
  const soundLost = useRef<HTMLAudioElement | null>(null);
  const soundOminous = useRef<HTMLAudioElement | null>(null);

  const currentProfenAvatar = gameStatus === GameStatus.LOST_MENTAL ? BLACK_AVATAR : PROFEN_AVATAR;

  useEffect(() => {
    soundReceive.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    soundSend.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    soundStartup.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    soundWon.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); 
    soundLost.current = new Audio('https://assets.mixkit.co/active_storage/sfx/256/256-preview.mp3');  
    soundOminous.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2135/2135-preview.mp3'); 
    
    if (soundReceive.current) soundReceive.current.volume = 0.4;
    if (soundSend.current) soundSend.current.volume = 0.3;
    if (soundStartup.current) soundStartup.current.volume = 0.5;
    if (soundWon.current) soundWon.current.volume = 0.5;
    if (soundLost.current) soundLost.current.volume = 0.4;
    if (soundOminous.current) soundOminous.current.volume = 0.6;
  }, []);

  const playSound = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const addMessage = useCallback((sender: 'profen' | 'user' | 'system', content: string, image?: string, isError?: boolean) => {
    const now = new Date();
    const timeStr = `今日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      content,
      timestamp: timeStr,
      image,
      isError
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (sender === 'profen' && !isError) {
      playSound(soundReceive);
    }
  }, [isMuted]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame or a tiny timeout to ensure the DOM has updated
      // Especially important when conditional endings are rendered.
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, gameStatus, scrollToBottom]);

  const startGame = () => {
    playSound(soundStartup);
    setGameStatus(GameStatus.PLAYING);
    setCurrentRound(0);
    setGameBranch(null);
    setMessages([]);
    setSocialEndingText("");
    triggerProfenMessage(0);
  };

  const triggerProfenMessage = (roundIdx: number, branch?: '6A' | '6B') => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let round;
      if (branch === '6A') round = ROUND_6A;
      else if (branch === '6B') round = ROUND_6B;
      else round = GAME_ROUNDS[roundIdx];

      const image = roundIdx === 1 ? 'https://baseec-img-mng.akamaized.net/images/item/origin/c6821fac745336ae46eb18ad4631ddeb.jpg?imformat=generic' : undefined; 
      addMessage('profen', round.profenPrompt, image);
    }, 1500);
  };

  const handleChoice = (choice: Choice) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    playSound(soundSend);
    addMessage('user', choice.text);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      // -- ROUND 1 --
      if (currentRound === 0) {
        addMessage('profen', choice.nextMessage);
        setCurrentRound(1);
        triggerProfenMessage(1);
        return;
      }

      // -- ROUND 2 --
      if (currentRound === 1) {
        addMessage('profen', choice.nextMessage);
        setCurrentRound(2);
        triggerProfenMessage(2);
        return;
      }

      // -- ROUND 3 --
      if (currentRound === 2) {
        if (choice.id === '3B') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setSocialEndingText("慌てて謝ろうと文字を打つが、送信ボタンを押してもエラーが出る。ブロックされた。\n数日後、タイムラインに流れてきたのは、見覚えのある自分とのトーク画面のスクリーンショット。「出会い厨きもい」「家ついていくとかやば（笑）」という嘲笑と共に、数万リツイートされていた。\n俺の身元特定も始まり、スマホの通知は止まらない。俺は静かに全てのアカウントを削除し、ネットから姿を消した。");
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_SOCIAL);
            playSound(soundLost);
            playSound(soundOminous);
            setTimeout(() => addMessage('user', '冗談だよ！', undefined, true), 800);
          }, 2500);
          return;
        }
        if (choice.id === '3C') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_MENTAL);
            playSound(soundLost);
            playSound(soundOminous);
          }, 2500);
          return;
        }
        addMessage('profen', choice.nextMessage);
        setCurrentRound(3);
        triggerProfenMessage(3);
        return;
      }

      // -- ROUND 4 --
      if (currentRound === 3) {
        if (choice.id === '4A') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setSocialEndingText("慌てて謝ろうと文字を打つが、送信ボタンを押してもエラーが出る。ブロックされた。\n数日後、タイムラインに流れてきたのは、見覚えのある自分とのトーク画面のスクリーンショット。「出会い厨きもい」「スカート強要するのきもいｗ」という嘲笑と共に、数万リツイートされていた。\n俺の身元特定も始まり、スマホの通知は止まらない。俺は静かに全てのアカウントを削除し、ネットから姿を消した。");
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_SOCIAL);
            playSound(soundLost);
            playSound(soundOminous);
            setTimeout(() => addMessage('user', '冗談だってば...', undefined, true), 800);
          }, 2500);
          return;
        }
        if (choice.id === '4C') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_MENTAL);
            playSound(soundLost);
            playSound(soundOminous);
          }, 2500);
          return;
        }
        addMessage('profen', choice.nextMessage);
        setCurrentRound(4);
        triggerProfenMessage(4);
        return;
      }

      // -- ROUND 5 (Final message before Saturday) --
      if (currentRound === 4) {
        if (choice.id === '5A') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_MENTAL);
            playSound(soundLost);
            playSound(soundOminous);
          }, 2500);
          return;
        }
        
        addMessage('profen', choice.nextMessage);
        const branch = choice.id === '5B' ? '6B' : '6A';
        setGameBranch(branch);
        
        // Move to a non-existent index immediately to hide choice buttons during transition
        setCurrentRound(5); 

        setTimeout(() => {
          addMessage('system', '土曜日 約束当日');
          setTimeout(() => {
            setCurrentRound(6); 
            triggerProfenMessage(6, branch);
          }, 800);
        }, 2000);
        return;
      }

      // -- ROUND 6-A --
      if (currentRound === 6 && gameBranch === '6A') {
        if (choice.id === '6AA') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setSocialEndingText("慌てて謝ろうと文字を打つが、送信ボタンを押してもエラーが出る。ブロックされた。\n数日後、タイムラインに流れてきたのは、見覚えのある自分とのトーク画面のスクリーンショット。「完全にチ○ポ（笑）」「女をナメてる」という嘲笑と共に、数万リツイートされていた。\n俺の身元特定も始まり、スマホの通知は止まらない。俺は静かに全てのアカウントを削除し、ネットから姿を消した。");
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_SOCIAL);
            playSound(soundLost);
            playSound(soundOminous);
            setTimeout(() => addMessage('user', '違うんだって！', undefined, true), 800);
          }, 2500);
          return;
        }
        if (choice.id === '6AC') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_MENTAL);
            playSound(soundLost);
            playSound(soundOminous);
          }, 2500);
          return;
        }
        if (choice.id === '6AB') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.WON);
            playSound(soundWon);
          }, 2500);
          return;
        }
      }

      // -- ROUND 6-B --
      if (currentRound === 6 && gameBranch === '6B') {
        if (choice.id === '6BB') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setSocialEndingText("慌てて謝ろうと文字を打つが、送信ボタンを押してもエラーが出る。ブロックされた。\n数日後、タイムラインに流れてきたのは、見覚えのある自分とのトーク画面のスクリーンショット。「Amazonで買えば？とか言った挙句に家誘ってくるゴミ」「家誘うとかやば（笑）」という嘲笑と共に、数万リツイートされていた。\n俺の身元特定も始まり、スマホの通知は止まらない。俺は静かに全てのアカウントを削除し、ネットから姿を消した。");
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_SOCIAL);
            playSound(soundLost);
            playSound(soundOminous);
            setTimeout(() => addMessage('user', 'まって！', undefined, true), 800);
          }, 2500);
          return;
        }
        if (choice.id === '6BC') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.LOST_MENTAL);
            playSound(soundLost);
            playSound(soundOminous);
          }, 2500);
          return;
        }
        if (choice.id === '6BA') {
          addMessage('profen', choice.nextMessage);
          setCurrentRound(-1); // Clear choices immediately
          setTimeout(() => {
            setGameStatus(GameStatus.WON_FRIEND);
            playSound(soundWon);
          }, 2500);
          return;
        }
      }
    }, 1000);
  };

  const currentChoices = currentRound === 6 
    ? (gameBranch === '6A' ? ROUND_6A.choices : ROUND_6B.choices)
    : (GAME_ROUNDS[currentRound]?.choices || []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#313338]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-[#1e1f22] flex items-center px-4 shadow-sm z-10 bg-[#313338] flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-[#80848e] text-2xl font-light">#</span>
            <span className="font-bold text-white">雑談</span>
          </div>
          <div className="ml-auto flex items-center space-x-4 text-[#b5bac1]">
            <button onClick={() => setIsMuted(!isMuted)} className={`hover:text-white transition-colors ${isMuted ? 'text-[#f23f42]' : 'text-[#b5bac1]'}`}>
              {isMuted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
            <svg className="w-6 h-6 cursor-pointer hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
            <svg className="w-6 h-6 cursor-pointer hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </div>
        </div>

        {/* Message List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pt-4 space-y-1 scroll-smooth">
          {gameStatus === GameStatus.START && (
             <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-4xl font-bold animate-pulse shadow-lg overflow-hidden border-2 border-[#ff73fa]">
                  <img src={PROFEN_AVATAR} alt="Ibu" className="w-full h-full object-cover" />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-white">伊武 ﾌﾟﾛﾌｪﾝ 攻略</h1>
                  <p className="text-[#b5bac1]">彼女と仲良くなり、土曜日のデートを目指せ！</p>
                </div>
                <button 
                  onClick={startGame}
                  className="px-8 py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold rounded transition-all hover:scale-105 active:scale-95 text-lg shadow-xl"
                >
                  チャットを開始する
                </button>
             </div>
          )}
          
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} profenAvatar={currentProfenAvatar} />
          ))}
          
          {isTyping && (
            <div className="flex px-4 py-2 animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-full bg-[#313338] animate-pulse" />
              <div className="ml-4 bg-[#2b2d31] rounded-lg px-4 py-2 text-[#dbdee1] flex items-center space-x-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="text-xs ml-2 text-gray-400">伊武 ﾌﾟﾛﾌｪﾝ が入力中...</span>
              </div>
            </div>
          )}

          {/* Endings */}
          {gameStatus === GameStatus.WON && (
            <div className="p-8 bg-[#23a55922] border-l-4 border-[#23a559] m-4 rounded animate-in slide-in-from-bottom-4 duration-500 shadow-lg">
              <h2 className="text-xl font-bold text-[#23a559] mb-4">【エンディング：ご褒美フルコース】</h2>
              <p className="italic text-[#dbdee1] mb-2">「（居酒屋にて。お猪口を片手に、少し顔を赤くして笑うプロフェン）」</p>
              <p className="mb-4 text-[#dbdee1] leading-relaxed">
                「……ふぅ。最高。やっぱ予約して正解だったね、この店。あんた、今日はカラオケ朝まで付き合うって言ったの、忘れてないよね？<br/>
                ……あー、明日も明後日も、ずっとこのまま休みならいいのに。まあ、あんたと飲む酒が美味いから、来週の出社もなんとか耐えてあげるわ。<br/>
                ……お礼。私の部屋で『本気のつまみ』作ってあげるから。覚悟しときなさいよ。」
              </p>
              <button onClick={startGame} className="text-xs text-[#b5bac1] hover:underline">もう一度プレイ</button>
            </div>
          )}

          {gameStatus === GameStatus.WON_FRIEND && (
            <div className="p-8 bg-[#5865f222] border-l-4 border-[#5865f2] m-4 rounded animate-in slide-in-from-bottom-4 duration-500 shadow-lg">
              <h2 className="text-xl font-bold text-[#5865f2] mb-4">【エンディング：最高の親友】</h2>
              <p className="mb-4 text-[#dbdee1] leading-relaxed">
                居酒屋で、彼女は「あんた、本当可愛げないわｗ」と笑いながら、あなたの頭をバシバシ叩いている。<br/>
                恋愛のようなドキドキはないけれど、彼女と肩を組んで笑い合える、世界で一番居心地の良い「悪友」になった。<br/>
                手料理の件はなくなったが、これからもネットとリアルを行き来する、腐れ縁のような関係が続いていく。
              </p>
              <button onClick={startGame} className="text-xs text-[#b5bac1] hover:underline">もう一度プレイ</button>
            </div>
          )}

          {gameStatus === GameStatus.LOST_SOCIAL && (
            <div className="p-8 bg-[#f23f4222] border-l-4 border-[#f23f42] m-4 rounded animate-in slide-in-from-bottom-4 duration-500 shadow-lg">
              <h2 className="text-xl font-bold text-[#f23f42] mb-4">💀 BAD END：社会的抹殺</h2>
              <p className="mb-4 text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
                {socialEndingText}
              </p>
              <button onClick={startGame} className="text-xs text-[#b5bac1] hover:underline">もう一度プレイ</button>
            </div>
          )}

          {gameStatus === GameStatus.LOST_MENTAL && (
            <div className="p-8 bg-[#f23f4222] border-l-4 border-[#f23f42] m-4 rounded animate-in slide-in-from-bottom-4 duration-500 shadow-lg">
              <h2 className="text-xl font-bold text-[#f23f42] mb-4">💀 BAD END：精神的崩壊</h2>
              <p className="mb-4 text-[#dbdee1] leading-relaxed">
                その直後、彼女のアイコンが真っ黒な画像に変わり、VRChatのフレンドリストからも名前が消えた。<br/>
                数日後、彼女のTwitterアカウントに一つの長文が投稿された。<br/><br/>
                「娘の母です。娘が大変お世話になりました。娘は現在……」<br/><br/>
                そこから先は、あまりにも長くて、重くて、怖くて、まだ読めていない。彼女が今どこで何をしているのか、俺はもう知る術がない。
              </p>
              <button onClick={startGame} className="text-xs text-[#b5bac1] hover:underline">もう一度プレイ</button>
            </div>
          )}
        </div>

        {/* Interaction Area */}
        <div className="px-4 py-4 flex-shrink-0 bg-[#313338]">
          {gameStatus === GameStatus.PLAYING && !isTyping ? (
            <div className="space-y-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {currentChoices.length > 0 && (
                 <>
                   <p className="text-xs text-[#b5bac1] mb-1 font-bold flex items-center">
                     <span className="w-2 h-2 bg-[#5865f2] rounded-full mr-2 animate-pulse"></span>
                     返信を選択してください：
                   </p>
                   <div className="flex flex-col space-y-2">
                     {currentChoices.map(c => (
                       <button 
                        key={c.id}
                        onClick={() => handleChoice(c)}
                        className="w-full text-left px-4 py-3 bg-[#383a40] hover:bg-[#4e5058] border border-transparent hover:border-[#5865f2] rounded text-white text-sm transition-all shadow-sm active:scale-[0.98] focus:outline-none"
                       >
                         {c.text}
                       </button>
                     ))}
                   </div>
                 </>
               )}
            </div>
          ) : null}

          <div className="bg-[#383a40] rounded-lg px-4 h-11 flex items-center space-x-4">
             <div className="w-6 h-6 bg-[#b5bac1] rounded-full flex items-center justify-center text-[#313338] cursor-not-allowed">
               <span className="font-bold text-lg">+</span>
             </div>
             <input type="text" placeholder={gameStatus === GameStatus.PLAYING ? "#雑談 へのメッセージ" : "メッセージを送信できません"} disabled className="bg-transparent flex-1 outline-none text-[#dbdee1] placeholder-[#b5bac1] text-sm" />
             <div className="flex space-x-3 text-[#b5bac1]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0-1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
             </div>
          </div>
        </div>
      </div>

      {/* Member Sidebar */}
      <div className="w-64 bg-[#2b2d31] hidden xl:flex flex-col border-l border-[#1e1f22]">
        <div className="p-4 space-y-4">
          <div className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">プロフィール</div>
          <div className="flex flex-col items-center py-6 bg-[#1e1f22] rounded-lg shadow-inner">
             <div className="relative mb-3">
                <img src={currentProfenAvatar} className="w-24 h-24 rounded-full border-4 border-[#2b2d31] object-cover" alt="Ibu" />
                <div className={`absolute bottom-1 right-1 w-6 h-6 ${gameStatus === GameStatus.LOST_MENTAL ? 'bg-gray-500' : 'bg-green-500'} rounded-full border-4 border-[#1e1f22]`} />
             </div>
             <div className="text-xl font-bold text-white text-center px-2">伊武 ﾌﾟﾛﾌｪﾝ</div>
             <div className="text-sm text-[#b5bac1]">iprofen#0909</div>
          </div>
          <div className="space-y-2">
             <div className="text-xs font-bold text-white uppercase tracking-wider">自己紹介</div>
             <div className="text-sm text-[#dbdee1] bg-[#1e1f22] p-3 rounded leading-relaxed">
                伊武ﾌﾟﾛﾌｪﾝと申します。趣味：ゲーム、酒、たばこ、料理、ぬいぐるみ。
             </div>
          </div>
          <div className="space-y-1">
             <div className="text-xs font-bold text-white uppercase tracking-wider">役職</div>
             <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded bg-[#35363c] text-[10px] font-bold text-[#ff73fa] border border-[#ff73fa]">システムエンジニア</span>
                <span className="px-2 py-0.5 rounded bg-[#35363c] text-[10px] font-bold text-[#5865f2] border border-[#5865f2]">ストゼロ部員</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
