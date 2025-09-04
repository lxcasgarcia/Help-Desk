// Interface para resposta detalhada de técnico
export type TechnicianDetailResponse = {
  id: string;
  name: string;
  email: string;
  availability: string[];
  profileImage: string | null;
};

// Interface para dados de atualização de técnico
export type TechnicianUpdateData = {
  name: string;
  email: string;
  availability: string[];
};
