import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { NETWORK, NETWORK_CONFIGS } from './config/constants';

const client = new ApolloClient({
  uri: NETWORK_CONFIGS[NETWORK].subgraphUrl,
  cache: new InMemoryCache(),
  headers: {
    'Authorization': `Bearer ${NETWORK_CONFIGS[NETWORK].thegraphApiKey}`
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

reportWebVitals();
