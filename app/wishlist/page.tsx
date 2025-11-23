'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WishlistItem {
    id: string;
    item: string;
    name: string | null;
    created_at: string;
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching items:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    const addItem = async () => {
        if (!newItem.trim() || !newName.trim()) return;

        const { error } = await supabase
            .from('wishlist')
            .insert([{ item: newItem.trim(), name: newName.trim() }]);

        if (error) {
            console.error('Error adding item:', error);
        } else {
            setNewItem('');
            setNewName('');
            fetchItems();
        }
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting item:', error);
        } else {
            fetchItems();
        }
    };

    const startEditing = (item: WishlistItem) => {
        setEditingId(item.id);
        setEditText(item.item);
        setEditName(item.name || '');
    };

    const saveEdit = async () => {
        if (!editText.trim() || !editName.trim() || !editingId) return;

        const { error } = await supabase
            .from('wishlist')
            .update({ item: editText.trim(), name: editName.trim() })
            .eq('id', editingId);

        if (error) {
            console.error('Error updating item:', error);
        } else {
            setEditingId(null);
            setEditText('');
            setEditName('');
            fetchItems();
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setEditName('');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Shared Public Wishlist
                </h1>

                <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Your Name"
                            className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="I wish for..."
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        />
                        <button
                            onClick={addItem}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {loading ? (
                            <li className="p-6 text-center text-gray-500">Loading...</li>
                        ) : items.length === 0 ? (
                            <li className="p-6 text-center text-gray-500">No items yet. Add one above!</li>
                        ) : (
                            items.map((item) => (
                                <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                                    {editingId === item.id ? (
                                        <div className="flex-1 flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                                                placeholder="Name"
                                            />
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                            />
                                            <button
                                                onClick={saveEdit}
                                                className="text-green-600 hover:text-green-800 font-medium text-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{item.name}:</span>
                                                <span className="text-gray-900 text-lg">{item.item}</span>
                                            </div>
                                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="text-red-600 hover:text-red-900 font-medium text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
