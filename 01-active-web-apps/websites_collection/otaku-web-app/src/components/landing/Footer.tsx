"use client";
import React from 'react';
import Link from 'next/link';
import { Heart, Globe, Mail, Github, Twitter, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import FadeInSection from '@/components/ui/FadeInSection';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative py-20 border-t border-gray-800/50 bg-[#050505] text-center overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-900/5 rounded-full blur-[120px] pointer-events-none" />

      <FadeInSection>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Thank You Section */}
          <div className="mb-16">
            <Heart className="w-12 h-12 text-pink-600 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">
              Thank You For Supporting The Beta
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Your one dollar helps us keep the servers running.
              Updates are always free. Built by otakus, for otakus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/pricing"
                className="bg-white text-black px-10 py-3 font-bold rounded-md hover:bg-gray-200 transition text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              >
                Get Core for $1.00
              </Link>
              <Link
                href="/auth"
                className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest underline decoration-gray-700 underline-offset-4 transition"
              >
                Web Portal Login
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-md mx-auto mb-16">
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Stay Connected</h3>
            <p className="text-gray-500 text-sm mb-4">Get the latest updates delivered to your terminal.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="enter_email_address..."
                className="flex-grow bg-[#0a0a0c] border border-gray-800 text-white pl-4 pr-4 py-3 rounded-md focus:border-violet-500 outline-none font-mono text-sm placeholder-gray-600 transition"
              />
              <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid md:grid-cols-4 gap-8 text-left border-t border-gray-800/50 pt-12 mt-12">
            {/* Product */}
            <div>
              <h4 className="text-white font-bold uppercase mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-mono">
                <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/#roadmap" className="hover:text-white transition">Roadmap</Link></li>
                <li><Link href="/vn" className="hover:text-white transition">VN Studio</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-white font-bold uppercase mb-4 text-sm">Community</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-mono">
                <li><Link href="/blog" className="hover:text-white transition">DevLog / Blog</Link></li>
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold uppercase mb-4 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-mono">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 inline shrink-0" />
                  <a href="mailto:support@otakunexus.lt" className="hover:text-white transition">support@otakunexus.lt</a>
                </li>
                <li className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 shrink-0" />
                  <span>www.otakunexus.lt</span>
                </li>
              </ul>
              {/* Social icons */}
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-gray-500 hover:text-white">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-gray-500 hover:text-white">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-gray-500 hover:text-white">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold uppercase mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-mono">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">EULA</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600 font-mono uppercase">
              © 2026 {t.nav.brand}. {t.nav.system}
            </p>
            <p className="text-xs text-gray-600 font-mono">
              Made with ❤️ by Otakus for Otakus.
            </p>
          </div>
        </div>
      </FadeInSection>
    </footer>
  );
};

export default Footer;
