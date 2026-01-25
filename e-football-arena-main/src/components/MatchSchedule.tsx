// // import { motion } from "framer-motion";
// // import { Calendar, Clock, MapPin } from "lucide-react";
// //
// // interface Match {
// //   id: number;
// //   date: string;
// //   time: string;
// //   teamA: string;
// //   teamB: string;
// //   scoreA?: number;
// //   scoreB?: number;
// //   status: "upcoming" | "live" | "completed";
// // }
// //
// // const matches: Match[] = [
// //   { id: 1, date: "Jan 15", time: "20:00", teamA: "Thunder FC", teamB: "Cyber Eagles", status: "completed", scoreA: 3, scoreB: 1 },
// //   { id: 2, date: "Jan 15", time: "21:30", teamA: "Digital Lions", teamB: "Neon Strikers", status: "completed", scoreA: 2, scoreB: 2 },
// //   { id: 3, date: "Jan 16", time: "19:00", teamA: "Pixel Warriors", teamB: "Storm United", status: "live" },
// //   { id: 4, date: "Jan 16", time: "20:30", teamA: "Blaze FC", teamB: "Shadow Wolves", status: "upcoming" },
// //   { id: 5, date: "Jan 17", time: "19:00", teamA: "Volt Titans", teamB: "Frost Kings", status: "upcoming" },
// //   { id: 6, date: "Jan 17", time: "20:30", teamA: "Apex Legends", teamB: "Iron Giants", status: "upcoming" },
// // ];
// //
// // const MatchSchedule = () => {
// //   const getStatusStyles = (status: Match["status"]) => {
// //     switch (status) {
// //       case "live":
// //         return "bg-secondary text-secondary-foreground animate-pulse";
// //       case "completed":
// //         return "bg-muted text-muted-foreground";
// //       default:
// //         return "bg-primary/20 text-primary";
// //     }
// //   };
// //
// //   const getStatusText = (status: Match["status"]) => {
// //     switch (status) {
// //       case "live":
// //         return "LIVE";
// //       case "completed":
// //         return "FT";
// //       default:
// //         return "UPCOMING";
// //     }
// //   };
// //
// //   return (
// //     <section id="schedule" className="py-20 relative">
// //       <div className="absolute inset-0 bg-grid-pattern opacity-10" />
// //
// //       <div className="container px-4 relative z-10">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           whileInView={{ opacity: 1, y: 0 }}
// //           viewport={{ once: true }}
// //           transition={{ duration: 0.6 }}
// //         >
// //           <h2 className="section-title gradient-border pb-4">
// //             Match <span className="text-secondary">Schedule</span>
// //           </h2>
// //         </motion.div>
// //
// //         <div className="grid gap-4 max-w-4xl mx-auto mt-12">
// //           {matches.map((match, index) => (
// //             <motion.div
// //               key={match.id}
// //               initial={{ opacity: 0, x: -20 }}
// //               whileInView={{ opacity: 1, x: 0 }}
// //               viewport={{ once: true }}
// //               transition={{ delay: index * 0.1 }}
// //               className="card-esports p-4 md:p-6 hover:scale-[1.02] transition-transform duration-300"
// //             >
// //               <div className="flex flex-col md:flex-row items-center gap-4">
// //                 {/* Date & Time */}
// //                 <div className="flex items-center gap-4 text-muted-foreground text-sm md:w-32">
// //                   <div className="flex items-center gap-1">
// //                     <Calendar className="w-4 h-4" />
// //                     <span>{match.date}</span>
// //                   </div>
// //                   <div className="flex items-center gap-1">
// //                     <Clock className="w-4 h-4" />
// //                     <span>{match.time}</span>
// //                   </div>
// //                 </div>
// //
// //                 {/* Match */}
// //                 <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
// //                   <div className="flex-1 text-right">
// //                     <span className="font-heading font-bold text-lg md:text-xl">{match.teamA}</span>
// //                   </div>
// //
// //                   <div className="flex items-center gap-3">
// //                     {match.status === "completed" ? (
// //                       <>
// //                         <span className="text-2xl font-heading font-extrabold w-8 text-center">{match.scoreA}</span>
// //                         <span className="text-muted-foreground">-</span>
// //                         <span className="text-2xl font-heading font-extrabold w-8 text-center">{match.scoreB}</span>
// //                       </>
// //                     ) : (
// //                       <span className="text-muted-foreground font-medium">VS</span>
// //                     )}
// //                   </div>
// //
// //                   <div className="flex-1 text-left">
// //                     <span className="font-heading font-bold text-lg md:text-xl">{match.teamB}</span>
// //                   </div>
// //                 </div>
// //
// //                 {/* Status */}
// //                 <div className="md:w-28 flex justify-end">
// //                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(match.status)}`}>
// //                     {getStatusText(match.status)}
// //                   </span>
// //                 </div>
// //               </div>
// //             </motion.div>
// //           ))}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };
// //
// // export default MatchSchedule;
//
//
// import { motion } from "framer-motion";
// import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { matchApi, type Match } from "@/api/endpoints/matches";
//
// const MatchSchedule = () => {
//   const [refreshing, setRefreshing] = useState(false);
//
//   // Используем React Query для получения данных
//   const {
//     data: matches = [],
//     isLoading,
//     error,
//     refetch
//   } = useQuery({
//     queryKey: ['matches'],
//     queryFn: async () => {
//       const response = await matchApi.getAll();
//       return response.data;
//     },
//     refetchInterval: 30000, // Автообновление каждые 30 секунд
//   });
//
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await refetch();
//     setTimeout(() => setRefreshing(false), 500);
//   };
//
//   const getStatusStyles = (status: Match["status"]) => {
//     switch (status) {
//       case "live":
//         return "bg-red-500 text-white animate-pulse";
//       case "completed":
//         return "bg-gray-200 text-gray-800";
//       default:
//         return "bg-blue-100 text-blue-800";
//     }
//   };
//
//   const getStatusText = (status: Match["status"]) => {
//     switch (status) {
//       case "live":
//         return "LIVE";
//       case "completed":
//         return "FT";
//       default:
//         return "UPCOMING";
//     }
//   };
//
//   // Состояние загрузки
//   if (isLoading) {
//     return (
//       <section id="schedule" className="py-20 relative">
//         <div className="absolute inset-0 bg-grid-pattern opacity-10" />
//         <div className="container px-4 relative z-10">
//           <h2 className="section-title gradient-border pb-4">
//             Match <span className="text-secondary">Schedule</span>
//           </h2>
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//             <span className="ml-4 text-gray-600">Загрузка расписания...</span>
//           </div>
//         </div>
//       </section>
//     );
//   }
//
//   // Состояние ошибки
//   if (error) {
//     return (
//       <section id="schedule" className="py-20 relative">
//         <div className="absolute inset-0 bg-grid-pattern opacity-10" />
//         <div className="container px-4 relative z-10">
//           <h2 className="section-title gradient-border pb-4">
//             Match <span className="text-secondary">Schedule</span>
//           </h2>
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
//             <h3 className="text-yellow-800 font-bold mb-2">⚠️ Нет подключения к серверу</h3>
//             <p className="text-yellow-700 mb-4">
//               Не удалось загрузить расписание матчей. Убедитесь, что:
//             </p>
//             <ul className="text-left text-yellow-700 mb-4 space-y-1">
//               <li>• Django сервер запущен на порту 8000</li>
//               <li>• CORS настроен правильно</li>
//               <li>• API доступен по адресу: http://localhost:8000/api/efootball/matches/</li>
//             </ul>
//             <button
//               onClick={handleRefresh}
//               className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-medium"
//             >
//               Попробовать снова
//             </button>
//           </div>
//         </div>
//       </section>
//     );
//   }
//
//   return (
//     <section id="schedule" className="py-20 relative">
//       <div className="absolute inset-0 bg-grid-pattern opacity-10" />
//
//       <div className="container px-4 relative z-10">
//         <div className="flex justify-between items-center mb-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <h2 className="section-title gradient-border pb-4">
//               Match <span className="text-secondary">Schedule</span>
//             </h2>
//             <p className="text-muted-foreground mt-2">
//               {matches.length} матчей в расписании
//               {matches.filter(m => m.status === 'live').length > 0 && (
//                 <span className="ml-2 text-red-500 animate-pulse">
//                   • {matches.filter(m => m.status === 'live').length} LIVE
//                 </span>
//               )}
//             </p>
//           </motion.div>
//
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             {refreshing ? 'Обновление...' : 'Обновить'}
//           </button>
//         </div>
//
//         {matches.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-muted-foreground mb-4">
//               <Calendar className="w-16 h-16 mx-auto opacity-20" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">Расписание пусто</h3>
//             <p className="text-muted-foreground">
//               Добавьте матчи через административную панель Django
//             </p>
//             <a
//               href="http://localhost:8000/admin/core/match/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-block mt-4 text-blue-600 hover:text-blue-800"
//             >
//               Перейти в админку →
//             </a>
//           </div>
//         ) : (
//           <div className="grid gap-4 max-w-4xl mx-auto mt-8">
//             {matches.map((match, index) => (
//               <motion.div
//                 key={match.id}
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow hover:scale-[1.01] transition-transform duration-300"
//               >
//                 <div className="flex flex-col md:flex-row items-center gap-4">
//                   {/* Дата и время */}
//                   <div className="flex items-center gap-4 text-muted-foreground text-sm md:w-32">
//                     <div className="flex items-center gap-1">
//                       <Calendar className="w-4 h-4" />
//                       <span>{match.date}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Clock className="w-4 h-4" />
//                       <span>{match.time}</span>
//                     </div>
//                   </div>
//
//                   {/* Матч */}
//                   <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
//                     <div className="flex-1 text-right">
//                       <span className="font-bold text-lg md:text-xl">{match.teamA}</span>
//                       {match.location && (
//                         <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
//                           <MapPin className="w-3 h-3" />
//                           {match.location}
//                         </div>
//                       )}
//                     </div>
//
//                     <div className="flex items-center gap-3">
//                       {match.status === "completed" && match.scoreA !== null && match.scoreB !== null ? (
//                         <>
//                           <span className="text-2xl font-extrabold w-8 text-center">{match.scoreA}</span>
//                           <span className="text-muted-foreground">-</span>
//                           <span className="text-2xl font-extrabold w-8 text-center">{match.scoreB}</span>
//                         </>
//                       ) : match.status === "live" ? (
//                         <>
//                           <span className="text-lg font-bold w-8 text-center">{match.scoreA || '0'}</span>
//                           <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
//                           <span className="text-lg font-bold w-8 text-center">{match.scoreB || '0'}</span>
//                         </>
//                       ) : (
//                         <span className="text-muted-foreground font-medium">VS</span>
//                       )}
//                     </div>
//
//                     <div className="flex-1 text-left">
//                       <span className="font-bold text-lg md:text-xl">{match.teamB}</span>
//                       {match.tournament_round && (
//                         <div className="text-xs text-muted-foreground mt-1">
//                           {match.tournament_round}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//
//                   {/* Статус */}
//                   <div className="md:w-28 flex justify-end">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(match.status)}`}>
//                       {getStatusText(match.status)}
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//
//         {/* Отладочная информация для разработки */}
//         {process.env.NODE_ENV === 'development' && (
//           <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs max-w-4xl mx-auto">
//             <div className="flex items-center justify-between mb-2">
//               <span className="font-medium">API информация:</span>
//               <div className="flex gap-2">
//                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
//                   {matches.length} матчей
//                 </span>
//                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                   Django API: 8000
//                 </span>
//                 <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
//                   React: 3000
//                 </span>
//               </div>
//             </div>
//             <div className="text-gray-600 space-y-1">
//               <div>API Endpoint: http://localhost:8000/api/efootball/matches/</div>
//               <div>Admin Panel: http://localhost:8000/admin/core/match/</div>
//               <div>React Dev: http://localhost:3000</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };
//
// export default MatchSchedule;
//


import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface Match {
  id: number;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  status: "upcoming" | "live" | "completed";
}

const MatchSchedule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Замените этот URL на ваш реальный эндпоинт
      const response = await fetch("https://www.mfltj.com/api/efootball/matches/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load match schedule");

      // Fallback на статические данные при ошибке
      setMatches([
        { id: 1, date: "Jan 15", time: "20:00", teamA: "Thunder FC", teamB: "Cyber Eagles", status: "completed", scoreA: 3, scoreB: 1 },
        { id: 2, date: "Jan 15", time: "21:30", teamA: "Digital Lions", teamB: "Neon Strikers", status: "completed", scoreA: 2, scoreB: 2 },
        { id: 3, date: "Jan 16", time: "19:00", teamA: "Pixel Warriors", teamB: "Storm United", status: "live" },
        { id: 4, date: "Jan 16", time: "20:30", teamA: "Blaze FC", teamB: "Shadow Wolves", status: "upcoming" },
        { id: 5, date: "Jan 17", time: "19:00", teamA: "Volt Titans", teamB: "Frost Kings", status: "upcoming" },
        { id: 6, date: "Jan 17", time: "20:30", teamA: "Apex Legends", teamB: "Iron Giants", status: "upcoming" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Опционально: обновление данных каждые 30 секунд для live матчей
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyles = (status: Match["status"]) => {
    switch (status) {
      case "live":
        return "bg-secondary text-secondary-foreground animate-pulse";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const getStatusText = (status: Match["status"]) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "completed":
        return "FT";
      default:
        return "UPCOMING";
    }
  };

  return (
    <section id="schedule" className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title gradient-border pb-4">
            Расписание <span className="text-secondary">матчей</span>
          </h2>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-destructive"
          >
            <p>{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 max-w-4xl mx-auto mt-12">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-esports p-4 md:p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-4 text-muted-foreground text-sm md:w-32">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{match.time}</span>
                    </div>
                  </div>

                  {/* Match */}
                  <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                    <div className="flex-1 text-right">
                      <span className="font-heading font-bold text-lg md:text-xl">{match.teamA}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {match.status === "completed" ? (
                        <>
                          <span className="text-2xl font-heading font-extrabold w-8 text-center">{match.scoreA}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-2xl font-heading font-extrabold w-8 text-center">{match.scoreB}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-medium">VS</span>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <span className="font-heading font-bold text-lg md:text-xl">{match.teamB}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:w-28 flex justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(match.status)}`}>
                      {getStatusText(match.status)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchSchedule;
