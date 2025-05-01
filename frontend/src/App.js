import React from 'react';
import './App.css';
import ImageUploader from './ImageUploader';

function App() {
  return (
    <div className="App">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-6xl p-6">
          <span class="block">
              Klasifikasi Gambar <span class="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
                  Buah dan Sayuran
              </span> dan Informasi Gizinya
          </span>
      </h2>      
<ImageUploader />
    </div>
  );
}

export default App;
