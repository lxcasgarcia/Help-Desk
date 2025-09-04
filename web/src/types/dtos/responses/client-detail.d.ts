// Interface para resposta detalhada de cliente
export type ClientDetailResponse = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};

// Interface para dados de atualização de cliente
export type ClientUpdateData = {
  name: string;
  email: string;
};
