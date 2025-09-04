// Interface para resposta detalhada de serviço
export type ServiceDetailResponse = {
  id: string;
  name: string;
  value: number;
  active: boolean;
};

// Interface para dados de atualização de serviço
export type ServiceUpdateData = {
  name: string;
  value: number;
};
