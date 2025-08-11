import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Users, Award, BookOpen, Lightbulb, Building, Target, Shield, Zap, Database, ChartBar } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Advanced analytics and reporting tools to track faculty performance across multiple metrics.",
      features: [
        "Real-time performance tracking",
        "Comparative analysis",
        "Trend identification",
        "Custom reporting"
      ],
      color: "bg-blue-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Faculty Management",
      description: "Comprehensive faculty profile management with detailed achievement tracking and editing capabilities.",
      features: [
        "Profile creation and editing",
        "Achievement tracking",
        "Department management",
        "Role-based access"
      ],
      color: "bg-green-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Achievement Recognition",
      description: "Systematic tracking and recognition of faculty achievements across research and academic activities.",
      features: [
        "Publication tracking",
        "Patent monitoring",
        "Award recognition",
        "Performance ranking"
      ],
      color: "bg-purple-500"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Research Tracking",
      description: "Comprehensive tracking of research activities including publications, proposals, and funding.",
      features: [
        "Publication management",
        "R&D proposal tracking",
        "Funding monitoring",
        "Collaboration tracking"
      ],
      color: "bg-orange-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation Management",
      description: "Track innovative activities including patents, certifications, and industry collaborations.",
      features: [
        "Patent tracking",
        "Certification management",
        "Industry partnerships",
        "Innovation metrics"
      ],
      color: "bg-red-500"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Professional Development",
      description: "Monitor and support faculty professional development activities and training programs.",
      features: [
        "FDP tracking",
        "Training programs",
        "Skill development",
        "Career progression"
      ],
      color: "bg-indigo-500"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "Role-based access control with secure login and session management."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Instant data synchronization and real-time performance monitoring."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Management",
      description: "Efficient data storage and retrieval with backup and recovery systems."
    },
    {
      icon: <ChartBar className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive analytics with interactive charts and visualizations."
    }
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
          <h1 className="text-4xl font-bold">Our Services</h1>
        </div>

        {/* Hero Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Faculty Management Solutions</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our platform provides a complete suite of services designed to enhance faculty performance 
                tracking, improve institutional efficiency, and foster academic excellence through 
                data-driven insights and comprehensive management tools.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${service.color} text-white`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </div>
                <p className="text-muted-foreground">{service.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                For Institutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Efficiency</Badge>
                  <p className="text-sm text-muted-foreground">
                    Streamlined faculty management processes and automated reporting.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Insights</Badge>
                  <p className="text-sm text-muted-foreground">
                    Data-driven decision making with comprehensive analytics.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Compliance</Badge>
                  <p className="text-sm text-muted-foreground">
                    Maintain accurate records for accreditation and audits.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Recognition</Badge>
                  <p className="text-sm text-muted-foreground">
                    Identify and reward top-performing faculty members.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                For Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Visibility</Badge>
                  <p className="text-sm text-muted-foreground">
                    Showcase achievements and contributions transparently.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Growth</Badge>
                  <p className="text-sm text-muted-foreground">
                    Track progress and identify areas for improvement.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Recognition</Badge>
                  <p className="text-sm text-muted-foreground">
                    Get acknowledged for contributions and achievements.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Development</Badge>
                  <p className="text-sm text-muted-foreground">
                    Access professional development opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Implementation Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Evaluate current processes and identify requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Setup</h4>
                <p className="text-sm text-muted-foreground">
                  Configure the platform and import existing data.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Training</h4>
                <p className="text-sm text-muted-foreground">
                  Provide comprehensive training to users.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2">Launch</h4>
                <p className="text-sm text-muted-foreground">
                  Go live with full support and monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Faculty Management?</h3>
            <p className="text-muted-foreground mb-6">
              Experience the power of data-driven faculty management and unlock the full potential of your academic institution.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/login')}>
                Start Using Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Get in Touch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  </div>
);
};

export default Services;
