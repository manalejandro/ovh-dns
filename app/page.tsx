'use client';

import { useState } from 'react';
import DNSManager from '@/components/DNSManager';
import Settings from '@/components/Settings';
import { Globe, Settings as SettingsIcon } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dns' | 'settings'>('dns');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">OVH DNS Manager</h1>
                <p className="text-sm text-gray-500 mt-1">Multi-account management with automatic updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('dns')}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'dns'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="h-5 w-5 mr-2" />
                DNS Manager
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SettingsIcon className="h-5 w-5 mr-2" />
                Configuración
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-300">
          {activeTab === 'dns' && <DNSManager />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>OVH DNS Manager - Gestor moderno de DNS con soporte multi-cuenta</p>
            <p className="mt-1">© {new Date().getFullYear()} - Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
