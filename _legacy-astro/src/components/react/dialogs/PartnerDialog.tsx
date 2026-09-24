import { useAppStore } from "../../../lib/store";
import { Button } from "../ui";

export function PartnerDialog({ seller }: { seller: string }) {
  const closeDialog = useAppStore((s) => s.closeDialog);
  return (
    <div>
      <h2 className="text-[28px] m-0 mb-3 pr-10">Canal de venda</h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Você escolheu {seller === "ingresso" ? "Ingresso.com" : seller}. A ligação de compra para esta sessão não está integrada na
        homologação.
      </p>
      <Button primary onClick={() => closeDialog()}>
        Voltar à programação
      </Button>
    </div>
  );
}
