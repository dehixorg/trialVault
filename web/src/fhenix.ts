export type EncryptedCriteria = {
  criteriaHash: string;
  payload: Record<string, unknown>;
};

export type EncryptedPatientPayload = {
  ciphertextHash: string;
  fields: Record<string, string>;
};

type ConnectResult = {
  address: string;
  networkName: string;
};

const buildHash = () =>
  "0x" +
  Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export class FhenixAdapter {
  async connectWallet(): Promise<ConnectResult> {
    if ((window as any).ethereum?.request) {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts?.[0] ?? "0xDEMO";
      return {
        address,
        networkName: "Injected Wallet",
      };
    }

    return {
      address: "0xDEMO",
      networkName: "Demo Wallet",
    };
  }

  async encryptCriteria(payload: Record<string, unknown>): Promise<EncryptedCriteria> {
    return {
      criteriaHash: buildHash(),
      payload,
    };
  }

  async encryptPatientData(payload: Record<string, number | string>): Promise<EncryptedPatientPayload> {
    const fields = Object.fromEntries(
      Object.entries(payload).map(([key]) => [key, buildHash()])
    );

    return {
      ciphertextHash: buildHash(),
      fields,
    };
  }

  async requestAggregateReceipt(): Promise<string> {
    return buildHash();
  }

  async requestCohortCount(): Promise<number> {
    return Math.floor(Math.random() * 5) + 1;
  }
}

export const fhenixAdapter = new FhenixAdapter();
