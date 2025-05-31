
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TesteDescricaoIA from '@/components/TesteDescricaoIA';

const TesteIA = () => {
  const [currentPage, setCurrentPage] = useState('teste-ia');

  const handleNavigate = (page: string) => {
    // Para a página de teste, só mantemos a navegação básica
    setCurrentPage(page);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <TesteDescricaoIA />
    </Layout>
  );
};

export default TesteIA;
