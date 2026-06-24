import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Planning from './pages/Planning';
import Coaches from './pages/Coaches';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Planning />} />
          <Route path="/coaches" element={<Coaches />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
