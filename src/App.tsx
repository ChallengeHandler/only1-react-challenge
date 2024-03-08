import React from 'react';
import logo from './logo.svg';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import './App.css';
import AutoComplete from './components/AutoComplete';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
          <AutoComplete />
      </div>
    </QueryClientProvider>
  );
}

export default App;
