import { useContext } from 'react';
import { CsrfContext } from '../public/CsrfProvider';

function ExampleCsrfUsage() {
  const { api } = useContext(CsrfContext);

  // Example usage:
  // api.post('/your-endpoint', data)

  return <div>CSRF-protected API usage example.</div>;
}

export default ExampleCsrfUsage;
