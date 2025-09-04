// Interface para resposta de cliente da API
export type ClientAPIResponse = {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  totalCalls: number;
  createdAt: string;
  updatedAt: string;
};

// Interface para resposta paginada de clientes da API
export type ClientsPaginationAPIResponse = {
  clients: ClientAPIResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
