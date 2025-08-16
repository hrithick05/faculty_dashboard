import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, TrendingUp, Calendar } from "lucide-react";

const DashboardHeader = ({ 
  totalFaculty, 
  totalAchievements, 
  currentPeriod = "2024 Academic Year" 
}) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-xl p-6 shadow-elevated">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight">Faculty Achievement Dashboard</h1>
            <p className="text-primary-foreground/80 flex items-center gap-2 mt-2 text-sm lg:text-base">
              <Calendar className="w-4 h-4" />
              {currentPeriod}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4 w-full lg:w-auto">
          <div className="text-center lg:text-right bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center lg:justify-end gap-2 text-primary-foreground/80 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Total Faculty</span>
              <span className="sm:hidden">Faculty</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold">{totalFaculty}</div>
          </div>
          
          <div className="text-center lg:text-right bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center lg:justify-end gap-2 text-primary-foreground/80 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Total Achievements</span>
              <span className="sm:hidden">Achievements</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold">{totalAchievements.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-6">
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30 px-3 py-1 text-sm">
          Research Excellence
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30 px-3 py-1 text-sm">
          Innovation Hub
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30 px-3 py-1 text-sm">
          Academic Leadership
        </Badge>
      </div>
    </div>
  );
};

export default DashboardHeader;
