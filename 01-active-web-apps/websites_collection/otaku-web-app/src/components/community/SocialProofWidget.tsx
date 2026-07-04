
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Newspaper, UserPlus, ExternalLink, X, Users, Globe } from 'lucide-react';

interface SocialProofEvent {
    id: string;
    type: 'purchase' | 'blog' | 'join' | 'view';
    user: string;
    message: string;
    link?: string; // Optional link to blog
    timestamp: string;
}

const MOCK_EVENTS: SocialProofEvent[] = [
    { id: '1', type: 'purchase', user: 'K4T0', message: 'bought Founder\'s Pack ($1.00)', timestamp: 'Just now' },
    { id: '2', type: 'blog', user: 'IronMouse', message: 'is reading "Sync Protocol Deep Dive"', link: 'blog', timestamp: '2m ago' },
    { id: '3', type: 'join', user: 'Gigguk_Fan', message: 'joined the Guild', timestamp: '5m ago' },
    { id: '4', type: 'purchase', user: 'DarkSlayer', message: 'secured Lifetime License', timestamp: '1m ago' },
    { id: '5', type: 'blog', user: 'Anon', message: 'is reading "Winter 2024 Roadmap"', link: 'blog', timestamp: '12s ago' },
    { id: '6', type: 'view', user: 'Visitor from Japan', message: 'is viewing the Gallery', timestamp: 'Live' },
    { id: '7', type: 'view', user: 'Visitor from Lithuania', message: 'is checking Pricing', timestamp: 'Live' },
    { id: '8', type: 'purchase', user: 'AnimeAddict', message: 'upgraded to Core', timestamp: '30s ago' },
];

interface SocialProofWidgetProps {
    onBlogClick: () => void;
}

const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({ onBlogClick }) => {
    const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [liveCount, setLiveCount] = useState(1420);

    const [realEvents, setRealEvents] = useState<SocialProofEvent[]>([]);

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                const { getSupabase } = await import('@/lib/supabase/config');
                const supabase = getSupabase();
                
                // Get total user count for the "ONLINE" counter
                const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
                if (count !== null) {
                    setLiveCount(count); 
                }

                // Get recent joins
                const { data: recentUsers } = await supabase.from('user_profiles')
                    .select('display_name, created_at, purchase_date, purchase_type')
                    .order('created_at', { ascending: false })
                    .limit(10);

                const events: SocialProofEvent[] = [];
                let idCounter = 1;

                if (recentUsers) {
                    recentUsers.forEach(u => {
                        // Add join event
                        events.push({
                            id: `real-${idCounter++}`,
                            type: 'join',
                            user: u.display_name || 'A new adventurer',
                            message: 'joined the Guild',
                            timestamp: new Date(u.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        });

                        // If they purchased, add a purchase event
                        if (u.purchase_date) {
                            events.push({
                                id: `real-${idCounter++}`,
                                type: 'purchase',
                                user: u.display_name || 'An adventurer',
                                message: `supported development ${u.purchase_type ? `(${u.purchase_type})` : ''}`,
                                timestamp: new Date(u.purchase_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            });
                        }
                    });
                }

                // Shuffle events
                events.sort(() => Math.random() - 0.5);

                if (events.length > 0) {
                    setRealEvents(events);
                } else {
                    setRealEvents(MOCK_EVENTS);
                }
            } catch (err) {
                console.error("Failed to fetch real stats for widget", err);
                setRealEvents(MOCK_EVENTS);
            }
        };
        fetchRealStats();
    }, []);

    // Event Toast Cycle
    useEffect(() => {
        const cycleEvents = () => {
            setIsVisible(false);
            setTimeout(() => {
                const eventsList = realEvents.length > 0 ? realEvents : MOCK_EVENTS;
                const randomEvent = eventsList[Math.floor(Math.random() * eventsList.length)];
                setCurrentEvent(randomEvent);
                setIsVisible(true);
            }, 500); // Wait for fade out
        };

        const initialTimer = setTimeout(cycleEvents, 3000);
        const interval = setInterval(cycleEvents, Math.random() * 7000 + 8000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [realEvents]);

    if (!currentEvent) return null;

    const handleClick = () => {
        if (currentEvent.type === 'blog') {
            onBlogClick();
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3 items-start pointer-events-none">
            
            {/* Live Counter Badge */}
            <div className="bg-gray-900/90 backdrop-blur border border-green-500/30 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto hover:scale-105 transition">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold font-mono">{liveCount.toLocaleString()} ONLINE</span>
            </div>

            {/* Notification Toast */}
            <div 
                onClick={handleClick}
                className={`group flex items-center gap-3 p-3 pr-6 bg-[#0a0a0c]/90 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl cursor-pointer hover:border-violet-500/50 transition-all duration-500 transform pointer-events-auto ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} max-w-sm`}
            >
                <div className={`p-2 rounded-full ${
                    currentEvent.type === 'purchase' ? 'bg-green-500/20 text-green-400' : 
                    currentEvent.type === 'blog' ? 'bg-yellow-500/20 text-yellow-400' : 
                    currentEvent.type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-violet-500/20 text-violet-400'
                }`}>
                    {currentEvent.type === 'purchase' && <ShoppingBag className="w-4 h-4" />}
                    {currentEvent.type === 'blog' && <Newspaper className="w-4 h-4" />}
                    {currentEvent.type === 'join' && <UserPlus className="w-4 h-4" />}
                    {currentEvent.type === 'view' && <Globe className="w-4 h-4" />}
                </div>
                
                <div>
                    <p className="text-xs text-white">
                        <span className="font-bold">{currentEvent.user}</span> {currentEvent.message}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono flex items-center mt-0.5">
                        {currentEvent.timestamp}
                        {currentEvent.type === 'blog' && (
                            <span className="ml-2 text-violet-400 flex items-center group-hover:underline">
                                Read Article <ExternalLink className="w-2 h-2 ml-1" />
                            </span>
                        )}
                    </p>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    className="absolute top-1 right-1 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default SocialProofWidget;
