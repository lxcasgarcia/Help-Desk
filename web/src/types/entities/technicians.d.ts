// Interface para resposta de técnico da API
export type TechnicianAPIResponse = {
  id: string;
  userId: string;
  name: string;
  email: string;
  availability: string[];
  profileImage: string | null;
  activeCalls: number;
  createdAt: string;
};

// Interface para resposta paginada de técnicos da API
export type TechniciansPaginationAPIResponse = {
  technicians: TechnicianAPIResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
