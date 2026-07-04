'use client';

import React, { useState } from 'react';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';
import { MotionToggle } from '@/shared/components/MotionToggle';
import WebXRControls from '@/components/webxr/WebXRControls';
import { useWebXRAvailability } from '@/lib/webxr/useWebXRAvailability';
import '@/shared/styles/landing-anime.css';
import { User, Bell, Globe, Palette, Database, CreditCard, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserTier } from '../types/types';
import RPGProfile from '../components/profiles/RPGProfile';

interface SettingsPageProps {
  userTier: UserTier;
  onUpgrade: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ userTier, onUpgrade }) => {
  const { status } = useMembership();
  const hasPass = status ? canAccessMemberLibrary(status) : false;
  const webxr = useWebXRAvailability();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'rpg', label: 'RPG Character', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors
                        ${activeTab === tab.id
                          ? 'bg-violet-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                <div className="space-y-4">
                  <Input label="Username" placeholder="Enter username" defaultValue="otaku_user" />
                  <Input label="Email" type="email" placeholder="Enter email" defaultValue="user@example.com" />
                  <Input label="Bio" placeholder="Tell us about yourself" />
                  <Button variant="primary">Save Changes</Button>
                </div>
              </Card>
            )}

            {activeTab === 'rpg' && (
              <RPGProfile />
            )}

            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Email notifications</span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>New episode alerts</span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Community updates</span>
                    <input type="checkbox" className="w-5 h-5" />
                  </label>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Billing & Subscription</h2>
                {!hasPass && (
                  <div className="mb-6">
                    <LibraryPassCTA variant="inline" context="settings" hasPass={hasPass} />
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Current Plan</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-bold text-lg">
                          {userTier === 'premium' ? 'Premium' : 'Free'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {userTier === 'premium' 
                            ? 'All features unlocked' 
                            : 'Limited features'
                          }
                        </p>
                      </div>
                      {userTier === 'free' && (
                        <Button variant="primary" onClick={onUpgrade}>
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>
                  </div>

                  {userTier === 'premium' && (
                    <div>
                      <h3 className="font-semibold mb-2">Payment History</h3>
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">No payment history available</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'language' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Language Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Interface Language</label>
                    <select className="w-full bg-[#0f0e17] border border-gray-700 rounded-lg px-4 py-2 text-white">
                      <option>English</option>
                      <option>Lietuvių</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select className="w-full bg-[#0f0e17] border border-gray-700 rounded-lg px-4 py-2 text-white">
                      <option>Dark (Default)</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Motion</label>
                    <p className="text-xs text-gray-500 mb-3">Reduce animations for accessibility or performance.</p>
                    <MotionToggle />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">WebXR (VR / AR)</label>
                    <p className="text-xs text-gray-500 mb-3">
                      {webxr.checked && webxr.immersive
                        ? 'Your device supports immersive WebXR. Enter VR or AR from the guild room background.'
                        : 'Use the site in any browser. VR and AR appear automatically on Meta Quest, Vision Pro, and AR-capable phones.'}
                    </p>
                    <WebXRControls />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'data' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Data & Storage</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Library Size</p>
                    <p className="text-2xl font-bold">0 GB</p>
                  </div>
                  <Button variant="outline">Export Library Data</Button>
                  <Button variant="danger">Clear Cache</Button>
                </div>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Privacy & Security</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Profile visibility</span>
                    <select className="bg-[#0f0e17] border border-gray-700 rounded px-3 py-1">
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </label>
                  <Button variant="outline">Change Password</Button>
                  <Button variant="danger">Delete Account</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
