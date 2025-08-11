import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, TrendingUp, Calendar } from "lucide-react";

const DashboardHeader = ({ 
  totalFaculty, 
  totalAchievements, 
  currentPeriod = "2024 Academic Year" 
}) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-lg p-6 shadow-elevated">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Faculty Achievement Dashboard</h1>
            <p className="text-primary-foreground/80 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {currentPeriod}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Users className="w-4 h-4" />
              Total Faculty
            </div>
            <div className="text-2xl font-bold">{totalFaculty}</div>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <TrendingUp className="w-4 h-4" />
              Total Achievements
            </div>
            <div className="text-2xl font-bold">{totalAchievements.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
          Research Excellence
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
          Innovation Hub
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
          Academic Leadership
        </Badge>
      </div>
    </div>
  );
};

export default DashboardHeader;
