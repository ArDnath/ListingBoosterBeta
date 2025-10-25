'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add your form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Have a question or want to learn more? We&apos;d love to hear from you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              placeholder="Your message..."
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <p className="text-neutral-600 dark:text-neutral-400">support@listingbooster.com</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Phone</h3>
            <p className="text-neutral-600 dark:text-neutral-400">+1 (555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Address</h3>
            <p className="text-neutral-600 dark:text-neutral-400">123 Startup Street<br />Tech Valley, CA 94105</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
