import { useState } from "react";

// Hook simples para controle de paginação
export function usePagination(initialPage: number = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  // Avança ou retrocede a página garantindo limites
  const handlePagination = (action: "next" | "previous") => {
    setPage((prevPage) => {
      if (action === "next" && prevPage < totalPages) {
        return prevPage + 1;
      }
      if (action === "previous" && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  };

  return {
    page,
    totalPages,
    setPage,
    setTotalPages,
    handlePagination,
  };
}
