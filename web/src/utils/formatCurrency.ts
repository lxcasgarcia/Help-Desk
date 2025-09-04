// Função para formatar valor monetário no padrão brasileiro sem símbolo da moeda
export function FormatCurrency(value: number) {
  const currency = Intl.NumberFormat("pt-br", {
    style: "currency",
    currency: "BRL",
  });

  return currency.format(value).replace("R$", "");
}
