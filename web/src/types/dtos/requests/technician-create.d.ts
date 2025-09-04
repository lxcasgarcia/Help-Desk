// Interface para dados de criação de técnico
export type TechnicianCreateData = {
  name: string;
  email: string;
  password: string;
  availability: string[];
};

// Interface para resposta da criação de técnico
export type TechnicianCreateAPIResponse = {
  message: string;
  technician: {
    id: string;
    name: string;
    email: string;
    availability: string[];
    profileImage: string | null;
  };
};
