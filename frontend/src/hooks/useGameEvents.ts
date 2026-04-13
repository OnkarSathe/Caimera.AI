import { useEffect } from 'react';
import { getSocket } from '../socket/socketClient';
import { useGameStore } from '../store/gameStore';
import { Question, WinnerPayload, SyncPayload } from '../types';

export function useGameEvents() {
  const { setQuestion, setWinner, setLeaderboard, setConnectedCount, setConnected, syncState } =
    useGameStore();

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onSync = (data: SyncPayload) => {
      syncState({
        question: data.question,
        currentWinner: data.currentWinner,
        connectedCount: data.connectedCount,
        leaderboard: data.leaderboard,
      });
    };

    const onNewQuestion = (question: Question) => {
      setQuestion(question);
    };

    const onWinnerDeclared = (payload: WinnerPayload) => {
      setWinner(payload);
    };

    const onLeaderboardUpdate = (data: { leaderboard: ReturnType<typeof useGameStore.getState>['leaderboard'] }) => {
      setLeaderboard(data.leaderboard);
    };

    const onUserCountUpdate = (data: { count: number }) => {
      setConnectedCount(data.count);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sync', onSync);
    socket.on('new_question', onNewQuestion);
    socket.on('winner_declared', onWinnerDeclared);
    socket.on('leaderboard_update', onLeaderboardUpdate);
    socket.on('user_count_update', onUserCountUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sync', onSync);
      socket.off('new_question', onNewQuestion);
      socket.off('winner_declared', onWinnerDeclared);
      socket.off('leaderboard_update', onLeaderboardUpdate);
      socket.off('user_count_update', onUserCountUpdate);
    };
  }, [setQuestion, setWinner, setLeaderboard, setConnectedCount, setConnected, syncState]);
}
