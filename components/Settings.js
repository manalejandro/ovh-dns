'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Save, RefreshCw, Wifi, Clock } from 'lucide-react';

const Settings = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentIPs, setCurrentIPs] = useState({ ipv4: '', ipv6: '' });
    const [checkingIP, setCheckingIP] = useState(false);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
        setLoading(false);
    };

    const fetchCurrentIPs = async () => {
        try {
            const response = await fetch('/api/ip/current');
            const data = await response.json();
            if (data.success && data.ips) {
                setCurrentIPs(data.ips);
            }
        } catch (error) {
            console.error('Error fetching current IPs:', error);
        }
    };

    const checkIPs = async () => {
        setCheckingIP(true);
        try {
            const response = await fetch('/api/ip/current', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                setCurrentIPs(data.newIPs);
            }
        } catch (error) {
            console.error('Error checking IPs:', error);
        }
        setCheckingIP(false);
    };

    useEffect(() => {
        // Initial data loading
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchConfig();
        fetchCurrentIPs();
    }, []);

    const saveConfig = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            if (response.ok) {
                alert('Configuration saved successfully');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Error saving configuration');
        }
        setSaving(false);
    };

    const addAccount = () => {
        const newAccount = {
            id: `account${Date.now()}`,
            name: 'New Account',
            appKey: '',
            appSecret: '',
            consumerKey: '',
            endpoint: 'ovh-eu',
            domains: []
        };
        
        setConfig({
            ...config,
            ovhAccounts: [...config.ovhAccounts, newAccount]
        });
    };

    const removeAccount = (accountId) => {
        if (!confirm('Are you sure you want to delete this account?')) return;
        
        setConfig({
            ...config,
            ovhAccounts: config.ovhAccounts.filter(acc => acc.id !== accountId)
        });
    };

    const updateAccount = (accountId, field, value) => {
        setConfig({
            ...config,
            ovhAccounts: config.ovhAccounts.map(acc =>
                acc.id === accountId ? { ...acc, [field]: value } : acc
            )
        });
    };

    const addDomain = (accountId) => {
        const domain = prompt('Enter the domain name:');
        if (!domain) return;
        
        setConfig({
            ...config,
            ovhAccounts: config.ovhAccounts.map(acc =>
                acc.id === accountId 
                    ? { ...acc, domains: [...(acc.domains || []), domain] }
                    : acc
            )
        });
    };

    const removeDomainFromAccount = (accountId, domain) => {
        setConfig({
            ...config,
            ovhAccounts: config.ovhAccounts.map(acc =>
                acc.id === accountId 
                    ? { ...acc, domains: acc.domains.filter(d => d !== domain) }
                    : acc
            )
        });
    };

    const updateIPProvider = (providerId, field, value) => {
        setConfig({
            ...config,
            ipProviders: config.ipProviders.map(provider =>
                provider.id === providerId ? { ...provider, [field]: value } : provider
            )
        });
    };

    const updateAutoUpdate = (field, value) => {
        setConfig({
            ...config,
            autoUpdate: { ...config.autoUpdate, [field]: value }
        });
    };

    if (loading || !config) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                <p className="mt-4 text-lg text-gray-500">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl mr-4">
                        <SettingsIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
                        <p className="text-gray-500 mt-1">Manage your OVH accounts and IP providers</p>
                    </div>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                >
                    <Save className={`h-5 w-5 mr-2 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>

            {/* Current IPs Section */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Wifi className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">IPs Actuales</h3>
                    </div>
                    <button
                        onClick={checkIPs}
                        disabled={checkingIP}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${checkingIP ? 'animate-spin' : ''}`} />
                        Actualizar IPs
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">IPv4</p>
                        <p className="text-lg font-mono text-gray-900">{currentIPs.ipv4 || 'No disponible'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">IPv6</p>
                        <p className="text-lg font-mono text-gray-900">{currentIPs.ipv6 || 'No disponible'}</p>
                    </div>
                </div>
            </div>

            {/* OVH Accounts Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Cuentas OVH</h3>
                    <button
                        onClick={addAccount}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Account
                    </button>
                </div>
                
                <div className="space-y-4">
                    {config.ovhAccounts.map((account) => (
                        <div key={account.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <input
                                    type="text"
                                    value={account.name}
                                    onChange={(e) => updateAccount(account.id, 'name', e.target.value)}
                                    className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                />
                                <button
                                    onClick={() => removeAccount(account.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">App Key</label>
                                    <input
                                        type="text"
                                        value={account.appKey}
                                        onChange={(e) => updateAccount(account.id, 'appKey', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                        placeholder="Your OVH App Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">App Secret</label>
                                    <input
                                        type="password"
                                        value={account.appSecret}
                                        onChange={(e) => updateAccount(account.id, 'appSecret', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                        placeholder="Your OVH App Secret"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Key</label>
                                    <input
                                        type="password"
                                        value={account.consumerKey}
                                        onChange={(e) => updateAccount(account.id, 'consumerKey', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                        placeholder="Your OVH Consumer Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                                    <select
                                        value={account.endpoint}
                                        onChange={(e) => updateAccount(account.id, 'endpoint', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                    >
                                        <option value="ovh-eu">OVH Europe</option>
                                        <option value="ovh-ca">OVH Canada</option>
                                        <option value="ovh-us">OVH US</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Dominios</label>
                                    <button
                                        onClick={() => addDomain(account.id)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        + Add domain
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {account.domains?.map((domain) => (
                                        <span
                                            key={domain}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            {domain}
                                            <button
                                                onClick={() => removeDomainFromAccount(account.id, domain)}
                                                className="ml-2 text-blue-600 hover:text-blue-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {(!account.domains || account.domains.length === 0) && (
                                        <span className="text-sm text-gray-500 italic">No hay dominios configurados</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* IP Providers Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">IP Providers</h3>
                <div className="space-y-4">
                    {config.ipProviders.map((provider) => (
                        <div key={provider.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">{provider.name}</h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={provider.enabled}
                                        onChange={(e) => updateIPProvider(provider.id, 'enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {provider.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL IPv4</label>
                                    <input
                                        type="text"
                                        value={provider.ipv4Url}
                                        onChange={(e) => updateIPProvider(provider.id, 'ipv4Url', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL IPv6</label>
                                    <input
                                        type="text"
                                        value={provider.ipv6Url}
                                        onChange={(e) => updateIPProvider(provider.id, 'ipv6Url', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auto Update Section */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Clock className="h-6 w-6 text-purple-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">Actualización Automática</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.autoUpdate.enabled}
                            onChange={(e) => updateAutoUpdate('enabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {config.autoUpdate.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Interval (seconds)
                        </label>
                        <input
                            type="number"
                            value={config.autoUpdate.checkInterval}
                            onChange={(e) => updateAutoUpdate('checkInterval', parseInt(e.target.value))}
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 py-2 px-3"
                            min="60"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Domains
                        </label>
                        <input
                            type="text"
                            value={config.autoUpdate.targetDomains?.join(', ') || ''}
                            onChange={(e) => updateAutoUpdate('targetDomains', e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 py-2 px-3"
                            placeholder="domain1.com, domain2.com"
                        />
                    </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                    Automatic updates will periodically check public IPs and update DNS records for the specified domains.
                </p>
            </div>
        </div>
    );
};

export default Settings;
