import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";
import { getCookie } from '../utils/cookies';
import { isCurrentUserHeadOfDepartment } from '../utils/roleCheck';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isHeadOfDepartment, setIsHeadOfDepartment] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('loggedInFaculty') || getCookie('loggedInFaculty');

  // Check user's role from database
  useEffect(() => {
    async function checkUserRole() {
      if (isLoggedIn) {
        try {
          setIsLoadingRole(true);
          const isHead = await isCurrentUserHeadOfDepartment();
          setIsHeadOfDepartment(isHead);
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsHeadOfDepartment(false);
        } finally {
          setIsLoadingRole(false);
        }
      } else {
        setIsHeadOfDepartment(false);
        setIsLoadingRole(false);
      }
    }

    checkUserRole();
  }, [isLoggedIn]);

  const baseProductLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Top Performers', href: '/top-performer' },
    { name: 'Analytics', href: '/dashboard' },
  ];

  // Add Faculty link only for Head of Department (from database check)
  if (isHeadOfDepartment && !isLoadingRole) {
    baseProductLinks.splice(2, 0, { name: 'Add Faculty', href: '/add-faculty' });
  }

  const footerLinks = {
    product: baseProductLinks,
    company: [
      { name: 'About', href: '/about' },
      { name: 'Services', href: '/services' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/about' },
    ],
    support: [
      { name: 'Help Center', href: '/contact' },
      { name: 'Documentation', href: '/services' },
      { name: 'API Reference', href: '/services' },
      { name: 'Status', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/about' },
      { name: 'Terms of Service', href: '/about' },
      { name: 'Cookie Policy', href: '/about' },
      { name: 'GDPR', href: '/about' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: <Github className="w-4 h-4" /> },
    { name: 'Twitter', href: '#', icon: <Twitter className="w-4 h-4" /> },
    { name: 'LinkedIn', href: '#', icon: <Linkedin className="w-4 h-4" /> },
  ];

  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: 'support@facultydashboard.com' },
    { icon: <Phone className="w-4 h-4" />, text: '+1 (555) 123-4567' },
    { icon: <MapPin className="w-4 h-4" />, text: '123 Academic Drive, University City' },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Faculty Dashboard</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Empowering academic excellence through comprehensive faculty performance tracking and analytics.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactInfo.map((info, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-muted-foreground">{info.icon}</span>
                <span className="text-sm text-muted-foreground">{info.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Faculty Dashboard. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/about" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
