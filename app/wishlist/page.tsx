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

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.trim() || !newName.trim()) return;

    await supabase.from('wishlist').insert([
      { item: newItem.trim(), name: newName.trim() }
    ]);

    setNewItem('');
    setNewName('');
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('wishlist').delete().eq('id', id);
    fetchItems();
  };

  const startEditing = (item: WishlistItem) => {
    setEditingId(item.id);
    setEditText(item.item);
    setEditName(item.name || '');
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editName.trim() || !editingId) return;

    await supabase
      .from('wishlist')
      .update({ item: editText.trim(), name: editName.trim() })
      .eq('id', editingId);

    setEditingId(null);
    setEditText('');
    setEditName('');
    fetchItems();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditName('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-6">
          ECCO Team Wishlist
        </h1>

        {/* NEW ITEM FORM */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your Name"
              className="w-full sm:w-1/3 border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="I wish for..."
              className="flex-1 border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />

            <button
              onClick={addItem}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 shadow"
            >
              Add
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="p-12 text-center text-gray-400 text-lg">
              No items yet. Add one above!
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full sm:w-1/3 border rounded-md p-1"
                      />

                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 border rounded-md p-1"
                        autoFocus
                      />

                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-bold">{item.name}: </span>
                        <span>{item.item}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
