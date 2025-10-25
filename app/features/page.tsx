"use client";
import React from 'react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import { Sparkles, Zap, Image, ListChecks, BarChart, Shield, Clock, Palette, Globe } from 'lucide-react';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="p-3 mb-4 rounded-full bg-blue-50 text-blue-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

export default function FeaturesPage() {
  // CORRECT FIX: Call useRouter at the top level of the component
  const router = useRouter(); 

  const features = [
    {
      icon: <Image className="w-6 h-6" />,
      title: "AI-Powered Image Enhancement",
      description: "Transform your product photos with our advanced AI to make them stand out."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Background Removal",
      description: "Automatically remove backgrounds with precision in just one click."
    },
    {
      icon: <ListChecks className="w-6 h-6" />,
      title: "Product Description Generator",
      description: "Create compelling product descriptions that drive sales using AI."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data and images are always secure and private."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Dramatically reduce the time spent on product listing creation."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Marketplace Support",
      description: "Optimized for all major e-commerce platforms worldwide."
    }
  ];

  const handleGetStarted = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
            Powerful Features for Your Listings
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            Everything you need to create stunning product listings that convert
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-20 text-center bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to boost your listings?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who have transformed their e-commerce business with our tools.
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            onClick={handleGetStarted} 
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started for Free
          </button>
        </div>
      </div>
    </div>
  );
}