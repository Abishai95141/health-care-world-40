
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/contexts/AppContext';
import EnhancedNavigation from '@/components/EnhancedNavigation';
import StickyOfferBanner from '@/components/StickyOfferBanner';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    subject: '',
    message: '',
    subscribe: false
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      subject: '',
      message: ''
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubscribeChange = (checked: boolean | "indeterminate") => {
    setFormData(prev => ({ ...prev, subscribe: checked === true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      showToast('Thank you! We will get back to you soon.', 'success');
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        subject: '',
        message: '',
        subscribe: false
      });
    }
  };

  const isFormValid = formData.fullName.trim() && 
                     formData.email.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                     formData.subject.trim() && 
                     formData.message.trim();

  return (
    <div className="min-h-screen bg-white">
      <EnhancedNavigation />
      <StickyOfferBanner onShopNow={() => navigate('/shop')} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black py-24 mt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="w-24 h-0.5 bg-white mx-auto"></div>
            <h1 className="text-5xl lg:text-6xl font-light text-white tracking-tight">Get in Touch</h1>
            <p className="text-xl text-gray-300">We're Here to Help You 24/7</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Contact Form */}
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-light text-black tracking-tight">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`h-14 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                              text-lg transition-all duration-200 ${errors.fullName ? 'border-red-300' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-14 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                              text-lg transition-all duration-200 ${errors.email ? 'border-red-300' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Your Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="h-14 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                             text-lg transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`h-14 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                              text-lg transition-all duration-200 ${errors.subject ? 'border-red-300' : ''}`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message *
                  </Label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full px-6 py-4 border border-gray-200 rounded-2xl 
                              focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                              text-lg transition-all duration-200 resize-none ${
                      errors.message ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="subscribe"
                    checked={formData.subscribe}
                    onCheckedChange={handleSubscribeChange}
                    className="rounded-md"
                  />
                  <Label htmlFor="subscribe" className="text-gray-700">
                    Subscribe to our newsletter
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full h-14 text-lg font-medium rounded-2xl transition-all duration-300 ${
                    isFormValid
                      ? 'bg-black hover:bg-gray-800 text-white hover:scale-105 focus:ring-2 focus:ring-black'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Right Column - Company Details */}
            <div className="space-y-12">
              {/* Contact Information Card */}
              <div className="bg-gray-50 rounded-3xl p-10">
                <h3 className="text-2xl font-semibold text-black mb-8">Corporate Office</h3>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <div>
                    <p className="text-lg">
                      123 Green Pharmacy Road<br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-black">Phone:</strong>{' '}
                      <a 
                        href="tel:+912212345678" 
                        className="text-black hover:underline transition-all duration-200 
                                 focus:outline-none focus:ring-2 focus:ring-black rounded"
                      >
                        +91 22 1234 5678
                      </a>
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-black">Email:</strong>{' '}
                      <a 
                        href="mailto:support@capsulecare.com" 
                        className="text-black hover:underline transition-all duration-200 
                                 focus:outline-none focus:ring-2 focus:ring-black rounded"
                      >
                        support@capsulecare.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-black">Hours:</strong><br />
                      Mon–Sat: 8 AM – 8 PM<br />
                      Sun: 9 AM – 5 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-3xl h-80 flex items-center justify-center">
                <span className="text-gray-500 text-xl">Interactive Map</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call-to-Action Strip */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-white text-xl">
            Need Immediate Assistance? Call Us at{' '}
            <a 
              href="tel:+912212345678" 
              className="underline hover:no-underline transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-white rounded"
            >
              +91 22 1234 5678
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { title: 'Customer Service', links: [{ text: 'Contact Us', active: true }, { text: 'Returns' }, { text: 'FAQs' }, { text: 'Shipping Policy' }] },
              { title: 'Information', links: [{ text: 'About Us' }, { text: 'Privacy Policy' }, { text: 'Terms of Service' }, { text: 'Careers' }] },
              { title: 'Legal', links: [{ text: 'Terms of Service' }, { text: 'Privacy Policy' }, { text: 'Cookie Policy' }, { text: 'Compliance' }] }
            ].map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <button 
                        className={`transition-all duration-200 hover:scale-105 focus:outline-none 
                                  focus:ring-2 focus:ring-white focus:ring-offset-2 
                                  focus:ring-offset-black rounded-sm ${
                          link.active ? 'text-white font-semibold' :

 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {link.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Connect</h3>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social, index) => (
                  <button
                    key={social}
                    className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center 
                             hover:bg-white hover:scale-110 transition-all duration-300 
                             focus:outline-none focus:ring-2 focus:ring-white group"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-400 group-hover:bg-black rounded transition-colors duration-200"></div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-400">
                  © 2025 Capsule Care Pharma.<br />All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
