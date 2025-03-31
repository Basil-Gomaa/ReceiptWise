import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Trophy, Target, ChevronRight, Check, Rocket, Flame, Timer, TrendingUp, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type SavingsChallenge = {
  id: number;
  name: string;
  description: string | null;
  targetAmount: string;
  currentAmount: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  category: string;
  difficulty: string;
  icon: string | null;
  colorScheme: string | null;
  milestones: Array<{
    amount: number;
    reached: boolean;
    reward: string;
  }> | null;
};

type DifficultyBadgeProps = {
  difficulty: string;
};

const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  let badgeStyle = "";
  let icon = null;
  
  switch (difficulty.toLowerCase()) {
    case "easy":
      badgeStyle = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      icon = <Rocket className="h-3 w-3 mr-1" />;
      break;
    case "medium":
      badgeStyle = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      icon = <Flame className="h-3 w-3 mr-1" />;
      break;
    case "hard":
      badgeStyle = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      icon = <TrendingUp className="h-3 w-3 mr-1" />;
      break;
    default:
      badgeStyle = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      icon = <Target className="h-3 w-3 mr-1" />;
  }
  
  return (
    <Badge className={`${badgeStyle} flex items-center`} variant="outline">
      {icon}
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};

type TypeBadgeProps = {
  type: string;
};

const TypeBadge = ({ type }: TypeBadgeProps) => {
  let badgeStyle = "";
  let icon = null;
  
  switch (type.toLowerCase()) {
    case "weekly":
      badgeStyle = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      icon = <Timer className="h-3 w-3 mr-1" />;
      break;
    case "monthly":
      badgeStyle = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      icon = <Trophy className="h-3 w-3 mr-1" />;
      break;
    default:
      badgeStyle = "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300";
      icon = <Target className="h-3 w-3 mr-1" />;
  }
  
  return (
    <Badge className={`${badgeStyle} flex items-center`} variant="outline">
      {icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

type ChallengeCardProps = {
  challenge: SavingsChallenge;
  onProgress: (id: number, amount: number) => void;
};

const ChallengeCard = ({ challenge, onProgress }: ChallengeCardProps) => {
  const [amount, setAmount] = useState<number>(1);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  
  const currentAmount = parseFloat(challenge.currentAmount);
  const targetAmount = parseFloat(challenge.targetAmount);
  const progressPercent = Math.min((currentAmount / targetAmount) * 100, 100);
  
  // Format dates for display
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();
  
  // Calculate days remaining
  const today = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Random icon assignment
  const getIcon = () => {
    const iconMap: Record<string, JSX.Element> = {
      'coffee': <span className="text-2xl">☕</span>,
      'utensils': <span className="text-2xl">🍽️</span>,
      'shopping-bag': <span className="text-2xl">🛍️</span>,
      'target': <Target className="h-6 w-6" />,
      'trophy': <Trophy className="h-6 w-6" />
    };
    
    return challenge.icon && iconMap[challenge.icon] ? 
      iconMap[challenge.icon] : 
      <Trophy className="h-6 w-6" />;
  };
  
  const handleProgressUpdate = () => {
    onProgress(challenge.id, amount);
    setIsProgressDialogOpen(false);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <div className="flex items-start p-4">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0" 
            style={{ backgroundColor: challenge.colorScheme || '#3B82F6' }}
          >
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{challenge.name}</h3>
              <div className="flex space-x-1">
                <TypeBadge type={challenge.type} />
                <DifficultyBadge difficulty={challenge.difficulty} />
              </div>
            </div>
            
            {challenge.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{challenge.description}</p>
            )}
            
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress: {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            <div className="mt-3 flex justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                <span>{formattedStartDate} - {formattedEndDate}</span>
              </div>
              <div className={`font-medium ${daysRemaining > 5 ? 'text-gray-600 dark:text-gray-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Ended"}
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <div>
                <Badge variant={challenge.status === 'active' ? 'default' : challenge.status === 'completed' ? 'secondary' : 'destructive'}>
                  {challenge.status === 'active' ? 'Active' : 
                   challenge.status === 'completed' ? 'Completed' : 'Failed'}
                </Badge>
              </div>
              
              {challenge.status === 'active' && (
                <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Challenge Progress</DialogTitle>
                      <DialogDescription>
                        How much did you save on {challenge.category.toLowerCase()}?
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium">$</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProgressUpdate}>
                        Save Progress
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
        
        {/* Milestones Section */}
        {challenge.milestones && challenge.milestones.length > 0 && (
          <div className="px-4 pt-0 pb-4">
            <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-sm font-medium mb-2">Milestones</h4>
              <div className="space-y-2">
                {challenge.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full mr-2 flex items-center justify-center ${milestone.reached ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {milestone.reached ? (
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs flex justify-between">
                        <span className={`${milestone.reached ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
                          {formatCurrency(milestone.amount)}
                        </span>
                        <span className={`${milestone.reached ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {milestone.reward}
                        </span>
                      </div>
                      <Progress 
                        value={milestone.reached ? 100 : Math.min((currentAmount / milestone.amount) * 100, 99)} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default function Challenges() {
  const { data: challenges = [], isLoading, isError } = useQuery<SavingsChallenge[]>({
    queryKey: ['/api/savings-challenges'],
  });
  
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number, amount: number }) => {
      return apiRequest(`/api/savings-challenges/${id}/progress`, 'POST', { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-challenges'] });
      toast({
        title: "Progress updated",
        description: "Your savings challenge progress has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleProgressUpdate = (id: number, amount: number) => {
    updateProgressMutation.mutate({ id, amount });
  };
  
  // Group challenges by status
  const activeChallenges = challenges.filter(challenge => challenge.status === 'active');
  const completedChallenges = challenges.filter(challenge => challenge.status === 'completed');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Savings Challenges</h2>
        <Button variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Challenge
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center text-red-800 dark:text-red-300">
          Failed to load challenges. Please try again.
        </div>
      ) : (
        <>
          {activeChallenges.length === 0 && completedChallenges.length === 0 ? (
            <div className="text-center py-10">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Start saving money by creating your first challenge. Set goals, track progress, and earn rewards!
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Challenge
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeChallenges.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-lg font-semibold">Active Challenges</h3>
                    <Badge variant="outline" className="ml-2">
                      {activeChallenges.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {activeChallenges.map((challenge: SavingsChallenge) => (
                      <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onProgress={handleProgressUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {completedChallenges.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-lg font-semibold">Completed Challenges</h3>
                    <Badge variant="outline" className="ml-2">
                      {completedChallenges.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {completedChallenges.map((challenge: SavingsChallenge) => (
                      <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onProgress={handleProgressUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}