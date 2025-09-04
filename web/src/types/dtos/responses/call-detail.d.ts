// Interface para resposta detalhada de chamado da API
export type CallDetailAPIResponse = {
  call: {
    id: string;
    name: string;
    description: string;
    status: "open" | "in_progress" | "closed";
    createdAt: string;
    updatedAt: string | null;
    client: {
      name: string;
      email: string;
      profileImage?: string | null;
    };
    technician: {
      name: string;
      email: string;
      profileImage?: string | null;
    };
    services: Array<{
      id: string;
      name: string;
      assignedValue: number;
    }>;
    totalValue: number;
  };
};

// Interface para atualização de status de chamado
export type CallStatusUpdate = {
  status: "open" | "in_progress" | "closed";
};
