import { createRoot } from 'react-dom/client';

import { setAuthTokenGetter } from '@workspace/api-client-react';
import App from './App';
import { getOwnerKey } from './lib/owner';

import './index.css';

// Send this browser's secret key with every API request (see lib/owner.ts).
setAuthTokenGetter(() => getOwnerKey());

createRoot(document.getElementById('root')!).render(<App />);
