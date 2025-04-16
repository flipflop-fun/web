import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { subgraphUrl, THEGRAPH_API_KEY } from './config/constants';

const client = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
  headers: {
    'Authorization': `Bearer ${THEGRAPH_API_KEY}`
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
