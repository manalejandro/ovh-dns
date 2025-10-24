'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Edit, Trash2, RefreshCw, Check, X, Search, Filter } from 'lucide-react';

const DNSManager = () => {
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedRecords, setSelectedRecords] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [newRecord, setNewRecord] = useState({
        fieldType: 'A',
        subDomain: '',
        target: '',
        ttl: 3600
    });
    const [bulkUpdate, setBulkUpdate] = useState({
        show: false,
        target: '',
        type: 'A'
    });

    const fetchDomains = async () => {
        try {
            const response = await fetch('/api/domains');
            const data = await response.json();
            
            if (data.success && data.domains) {
                const domainList = data.domains.map(d => typeof d === 'string' ? d : d.domain);
                setDomains(domainList);
                
                if (domainList.length > 0 && !selectedDomain) {
                    setSelectedDomain(domainList[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    const fetchRecords = async () => {
        if (!selectedDomain) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/domains/${selectedDomain}/records`);
            const data = await response.json();
            
            if (data.success) {
                setRecords(data.records || []);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
        setLoading(false);
        setSelectedRecords(new Set());
    };

    useEffect(() => {
        fetchDomains();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedDomain) {
            fetchRecords();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDomain]);

    useEffect(() => {
        let filtered = records;

        if (filterType !== 'all') {
            filtered = filtered.filter(r => r.fieldType === filterType);
        }

        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.subDomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.target?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRecords(filtered);
    }, [records, searchTerm, filterType]);

    const handleAddRecord = async () => {
        try {
            const response = await fetch(`/api/domains/${selectedDomain}/records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            
            if (response.ok) {
                setShowAddRecord(false);
                setNewRecord({ fieldType: 'A', subDomain: '', target: '', ttl: 3600 });
                fetchRecords();
            }
        } catch (error) {
            console.error('Error adding record:', error);
        }
    };

    const handleUpdateRecord = async () => {
        try {
            const response = await fetch(`/api/domains/${selectedDomain}/records`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingRecord)
            });
            
            if (response.ok) {
                setEditingRecord(null);
                fetchRecords();
            }
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        
        try {
            const response = await fetch(`/api/domains/${selectedDomain}/records?recordId=${recordId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchRecords();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedRecords.size === 0) return;

        try {
            const response = await fetch(`/api/domains/${selectedDomain}/bulk-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: selectedDomain,
                    recordIds: Array.from(selectedRecords),
                    target: bulkUpdate.target,
                    fieldType: bulkUpdate.type
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setBulkUpdate({ show: false, target: '', type: 'A' });
                setSelectedRecords(new Set());
                fetchRecords();
            }
        } catch (error) {
            console.error('Error bulk updating records:', error);
        }
    };

    const toggleRecordSelection = (recordId) => {
        const newSelection = new Set(selectedRecords);
        if (newSelection.has(recordId)) {
            newSelection.delete(recordId);
        } else {
            newSelection.add(recordId);
        }
        setSelectedRecords(newSelection);
    };

    const selectAllFiltered = () => {
        if (selectedRecords.size === filteredRecords.length) {
            setSelectedRecords(new Set());
        } else {
            setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
        }
    };

    const refreshDNSZone = async () => {
        if (!selectedDomain) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/dns/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: selectedDomain })
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchRecords();
            }
        } catch (error) {
            console.error('Error refreshing DNS zone:', error);
        }
        setLoading(false);
    };

    const getRecordTypeColor = (type) => {
        const colors = {
            'A': 'bg-blue-500 text-white',
            'AAAA': 'bg-purple-500 text-white',
            'CNAME': 'bg-green-500 text-white',
            'MX': 'bg-orange-500 text-white',
            'TXT': 'bg-gray-500 text-white',
            'SRV': 'bg-pink-500 text-white',
            'NS': 'bg-yellow-500 text-white'
        };
        return colors[type] || 'bg-gray-500 text-white';
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
                        <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">DNS Manager</h2>
                        <p className="text-gray-500 mt-1">Manage your domain DNS records</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchRecords}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={refreshDNSZone}
                        disabled={loading || !selectedDomain}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Zone
                    </button>
                </div>
            </div>

            {/* Domain selector and actions */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Domain
                    </label>
                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all"
                    >
                        {domains.map((domain) => (
                            <option key={domain} value={domain}>
                                {domain}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="pt-7">
                    <button
                        onClick={() => setShowAddRecord(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Record
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por subdominio o valor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="block pl-4 pr-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="A">A (IPv4)</option>
                        <option value="AAAA">AAAA (IPv6)</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                        <option value="SRV">SRV</option>
                        <option value="NS">NS</option>
                    </select>
                </div>
            </div>

            {/* Bulk actions */}
            {selectedRecords.size > 0 && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedRecords.size} registro(s) seleccionado(s)
                        </span>
                        <button
                            onClick={() => setBulkUpdate({ ...bulkUpdate, show: true })}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Actualización masiva
                        </button>
                    </div>
                </div>
            )}

            {/* Add record form */}
            {showAddRecord && (
                <div className="mb-6 p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Nuevo Registro DNS</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={newRecord.fieldType}
                                onChange={(e) => setNewRecord({ ...newRecord, fieldType: e.target.value })}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                            >
                                <option value="A">A</option>
                                <option value="AAAA">AAAA</option>
                                <option value="CNAME">CNAME</option>
                                <option value="MX">MX</option>
                                <option value="TXT">TXT</option>
                                <option value="SRV">SRV</option>
                                <option value="NS">NS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                            <input
                                type="text"
                                value={newRecord.subDomain}
                                onChange={(e) => setNewRecord({ ...newRecord, subDomain: e.target.value })}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                placeholder="www, mail, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                            <input
                                type="text"
                                value={newRecord.target}
                                onChange={(e) => setNewRecord({ ...newRecord, target: e.target.value })}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                placeholder="IP, dominio, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">TTL</label>
                            <input
                                type="number"
                                value={newRecord.ttl}
                                onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowAddRecord(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddRecord}
                            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {/* Records table */}
            {loading ? (
                <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                    <p className="mt-4 text-lg text-gray-500">Loading records...</p>
                </div>
            ) : (
                <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                                        onChange={selectAllFiltered}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    TTL
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map((record, idx) => (
                                <tr key={record.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedRecords.has(record.id)}
                                            onChange={() => toggleRecordSelection(record.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRecordTypeColor(record.fieldType)}`}>
                                            {record.fieldType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {record.subDomain || '@'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                                        {record.target}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.ttl}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => setEditingRecord(record)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRecord(record.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-12 bg-gray-50">
                            <Globe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No se encontraron registros DNS</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit record modal */}
            {editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Record</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={editingRecord.fieldType}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, fieldType: e.target.value })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                >
                                    <option value="A">A</option>
                                    <option value="AAAA">AAAA</option>
                                    <option value="CNAME">CNAME</option>
                                    <option value="MX">MX</option>
                                    <option value="TXT">TXT</option>
                                    <option value="SRV">SRV</option>
                                    <option value="NS">NS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                                <input
                                    type="text"
                                    value={editingRecord.subDomain}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, subDomain: e.target.value })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                                <input
                                    type="text"
                                    value={editingRecord.target}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, target: e.target.value })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">TTL</label>
                                <input
                                    type="number"
                                    value={editingRecord.ttl}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, ttl: parseInt(e.target.value) })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => setEditingRecord(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                            >
                                <X className="h-4 w-4 inline mr-1" />
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRecord}
                                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all"
                            >
                                <Check className="h-4 w-4 inline mr-1" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk update modal */}
            {bulkUpdate.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Bulk Update</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Update {selectedRecords.size} selected record(s)
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                                <select
                                    value={bulkUpdate.type}
                                    onChange={(e) => setBulkUpdate({ ...bulkUpdate, type: e.target.value })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                >
                                    <option value="A">A (IPv4)</option>
                                    <option value="AAAA">AAAA (IPv6)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Value (IP)</label>
                                <input
                                    type="text"
                                    value={bulkUpdate.target}
                                    onChange={(e) => setBulkUpdate({ ...bulkUpdate, target: e.target.value })}
                                    placeholder={bulkUpdate.type === 'A' ? '192.168.1.1' : '2001:0db8:85a3::8a2e:0370:7334'}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => setBulkUpdate({ show: false, target: '', type: 'A' })}
                                className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUpdate}
                                disabled={!bulkUpdate.target}
                                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DNSManager;
