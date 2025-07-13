export interface RankingData {
    totalSpent: number;
    totalOrders: number;
    rankingPoints: number;
    currentRank: CustomerRank;
    nextRank: CustomerRank | null;
    progressPercentage: number;
    remainingSpent: number;
    remainingOrders: number;
    recentPurchases: {
        date: string;
        amount: number;
        points: number;
        items: string[];
    }[];
    availableRewards: {
        id: number;
        name: string;
        description: string;
        icon: string;
        pointsCost: number;
        claimed: boolean;
    }[];
}

export interface CustomerRank {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    backgroundColor: string;
    minSpent: number;
    minOrders: number;
    benefits: string[];
    gifts: {
        name: string;
        description: string;
        icon: string;
    }[];
    nextRankProgress?: number;
}