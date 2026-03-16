import { useState } from 'react';
import './App.css';
import LibraryPage from './pages/library/LibraryPage';
import { SearchPage } from './pages/search/SearchPage';

function App() {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
  const tabs: { id: 'tab1' | 'tab2'; label: string }[] = [
    { id: 'tab1', label: 'Biblioteca' },
    { id: 'tab2', label: 'Búsqueda' },
  ];

  return (
    <div className="mx-auto my-0 w-full max-w-9/10 px-4 py-8">
      <header className="mb-4 text-center">
        <h1 className="my-2 text-5xl">📚 Biblioteca Personal</h1>
        <p className="text-xl text-gray-400">Gestiona tu colección de libros</p>
      </header>

      <main>
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-2 text-lg font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          {activeTab === 'tab1' && <LibraryPage />}
          {activeTab === 'tab2' && <SearchPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
