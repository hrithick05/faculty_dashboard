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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Faculty Dashboard</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md text-sm leading-relaxed">
              Empowering academic excellence through comprehensive faculty performance tracking and analytics.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-200"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-600">{info.icon}</span>
                <span className="text-sm text-gray-700 font-medium">{info.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              © {currentYear} Faculty Dashboard. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-sm text-gray-600">
              <Link to="/about" className="hover:text-blue-600 transition-colors hover:underline">
                Privacy Policy
              </Link>
              <Link to="/about" className="hover:text-blue-600 transition-colors hover:underline">
                Terms of Service
              </Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors hover:underline">
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
