// Interface para resposta de chamado da API
export type CallAPIResponse = {
  id: string;
  name: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  createdAt: string;
  updatedAt: string | null;
  client: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  technician: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    assignedValue: number;
  }>;
  totalValue: number;
};

// Interface para resposta paginada de chamados da API
export type CallsPaginationAPIResponse = {
  calls: CallAPIResponse[];
  pagination: {
    page: number;
    perPage: number;
    totalRecords: number;
    totalPages: number;
  };
};
