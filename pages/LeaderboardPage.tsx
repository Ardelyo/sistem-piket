import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Student } from '../types';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank <= 10) {
      return (
        <span className="text-xs font-bold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">
          TOP 10
        </span>
      );
    }
    if (rank <= 20) {
      return (
        <span className="text-xs font-bold text-blue-800 bg-blue-200 px-2 py-1 rounded-full">
          RISING STAR
        </span>
      );
    }
    return null; // No badge for ranks > 20
};

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getStudents(); // getStudents returns a ranked list
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const PodiumItem: React.FC<{ student: Student, rank: number }> = ({ student, rank }) => {
    const podiumStyles = [
      { height: 'h-40', color: 'bg-yellow-400', textColor: 'text-yellow-600', rankText: '1st' }, // 1st
      { height: 'h-32', color: 'bg-gray-300', textColor: 'text-gray-500', rankText: '2nd' }, // 2nd
      { height: 'h-24', color: 'bg-amber-600', textColor: 'text-amber-800', rankText: '3rd' }, // 3rd
    ];
    const style = podiumStyles[rank - 1];

    return (
      <div className="flex flex-col items-center">
        <img src={student.foto} alt={student.namaLengkap} className="h-20 w-20 rounded-full border-4 border-background shadow-lg mb-2 z-10" />
        <div className={`w-full ${style.height} ${style.color} rounded-t-2xl flex flex-col justify-end items-center p-2 pt-8 -mt-10`}>
          <p title={student.namaLengkap} className="font-bold text-lg text-white text-center truncate w-full px-1">{student.nama}</p>
          <p className={`font-semibold ${style.textColor}`}>{student.xp} XP</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">Papan Peringkat</h1>
        <p className="text-text-light mt-1">Lihat siapa yang paling bersinar di kelas X-E8!</p>
      </div>

      <Card>
        {loading ? (
          <div className="grid grid-cols-3 gap-4 items-end h-48">
             <Skeleton className="h-32 rounded-t-2xl"/>
             <Skeleton className="h-40 rounded-t-2xl"/>
             <Skeleton className="h-24 rounded-t-2xl"/>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
            {topThree.find(s => s.rank === 2) ? <PodiumItem student={topThree.find(s => s.rank === 2)!} rank={2} /> : <div></div>}
            {topThree.find(s => s.rank === 1) ? <PodiumItem student={topThree.find(s => s.rank === 1)!} rank={1} /> : <div></div>}
            {topThree.find(s => s.rank === 3) ? <PodiumItem student={topThree.find(s => s.rank === 3)!} rank={3} /> : <div></div>}
          </div>
        )}
      </Card>
      
      <div className="space-y-3">
        {loading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-3xl" />)
        ) : (
            rest.map(student => (
                <Card key={student.id} className="flex items-center space-x-4 p-4">
                    <span className="text-xl font-bold text-text-light w-8 text-center">{student.rank}</span>
                    <img src={student.foto} alt={student.namaLengkap} className="h-14 w-14 rounded-full object-cover"/>
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2">
                            <p title={student.namaLengkap} className="font-bold text-lg text-primary truncate">{student.namaLengkap}</p>
                            <RankBadge rank={student.rank} />
                        </div>
                        <p className="text-sm text-text-light">Level {student.level}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-accent">{student.xp} XP</p>
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;