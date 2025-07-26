import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { NETWORK_CONFIGS } from './config/constants';

const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";

const client = new ApolloClient({
  uri: NETWORK_CONFIGS[network].subgraphUrl,
  cache: new InMemoryCache(),
  // headers: {
  //   'Authorization': `Bearer ${NETWORK_CONFIGS[network].thegraphApiKey}`
  // }
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
