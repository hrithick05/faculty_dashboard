import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Award, BookOpen, Lightbulb, Building, Target, BarChart3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Faculty Management",
      description: "Comprehensive faculty profile management with detailed achievement tracking."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Advanced analytics and ranking system to identify top-performing faculty members."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Publication Tracking",
      description: "Track research publications, patents, and academic achievements in real-time."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Research & Development",
      description: "Monitor R&D proposals, funding, and industry collaborations."
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Professional Development",
      description: "Track FDP works, certifications, and professional development activities."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      description: "Interactive charts and visualizations for data-driven insights."
    }
  ];

  const stats = [
    { label: "Faculty Members", value: "13+", color: "bg-blue-500" },
    { label: "Departments", value: "5", color: "bg-green-500" },
    { label: "Achievement Categories", value: "15+", color: "bg-purple-500" },
    { label: "Real-time Updates", value: "24/7", color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold">About Faculty Dashboard</h1>
        </div>

        {/* Hero Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Empowering Academic Excellence</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The Faculty Dashboard is a comprehensive platform designed to track, analyze, and showcase 
                faculty achievements across research, publications, patents, and professional development. 
                Our system provides real-time insights to help institutions recognize and support academic excellence.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold text-xl">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide a comprehensive digital platform that enables educational institutions to 
                systematically track, evaluate, and enhance faculty performance through data-driven 
                insights and transparent achievement monitoring.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To become the leading platform for academic performance management, fostering a 
                culture of excellence and continuous improvement in higher education institutions 
                worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features Detail */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge variant="secondary" className="mt-1">Dashboard</Badge>
                <div>
                  <h4 className="font-semibold">Comprehensive Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time dashboard with faculty statistics, achievement summaries, and performance metrics.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Badge variant="secondary" className="mt-1">Analytics</Badge>
                <div>
                  <h4 className="font-semibold">Performance Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced analytics with interactive charts, ranking systems, and comparative analysis.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Badge variant="secondary" className="mt-1">Management</Badge>
                <div>
                  <h4 className="font-semibold">Faculty Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, and manage faculty profiles with detailed achievement tracking.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Badge variant="secondary" className="mt-1">Security</Badge>
                <div>
                  <h4 className="font-semibold">Secure Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control with secure login and session management.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Frontend</h4>
                <p className="text-sm text-muted-foreground">React + Vite</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Backend</h4>
                <p className="text-sm text-muted-foreground">Supabase</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">UI Framework</h4>
                <p className="text-sm text-muted-foreground">Shadcn/ui</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Styling</h4>
                <p className="text-sm text-muted-foreground">Tailwind CSS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Experience the power of data-driven faculty management today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/login')}>
                Get Started
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  </div>
);
};

export default About;
