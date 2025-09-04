// Interface para resposta de serviço da API
export type ServiceAPIResponse = {
  id: string;
  name: string;
  value: number;
  active: boolean;
};

// Interface para resposta paginada de serviços da API
export type ServicesPaginationAPIResponse = {
  services: ServiceAPIResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
