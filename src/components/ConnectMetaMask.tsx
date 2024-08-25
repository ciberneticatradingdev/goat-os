import { createSignal } from "solid-js";
import { ethers } from "ethers";

const ConnectMetaMask = () => {
  const [account, setAccount] = createSignal<string | null>(null);

  const addWanchainTestnet = async () => {
    if (window.ethereum) {
      const chainId = '0x3e7'; // Wanchain Testnet Chain ID in hexadecimal (999 decimal)
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              chainName: 'Wanchain Testnet',
              nativeCurrency: {
                name: 'WAN',
                symbol: 'WAN',
                decimals: 18,
              },
              rpcUrls: ['https://gwan-ssl.wandevs.org:46891/'],
              blockExplorerUrls: ['https://testnet.wanscan.org'],
            },
          ],
        });
      } catch (error) {
        console.error("Error al agregar Wanchain Testnet a MetaMask:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await addWanchainTestnet();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();

        // Mensaje a firmar
        const message = "Iniciar sesión en Wanchain Testnet - Sesión válida por 30 minutos";
        const signature = await signer.signMessage(message);

        console.log("Firma del usuario:", signature);

        // Enviar la firma al servidor para su verificación y crear la sesión
        const response = await fetch("/api/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ account: accounts[0], signature, message }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Sesión iniciada, token recibido:", data.token);

          // Guardar el token en localStorage
          localStorage.setItem("auth_token", data.token);

          // Redirigir a la aplicación principal o a otra página
          window.location.href = "/dashboard";
        } else {
          console.error("Error al iniciar sesión:", await response.text());
        }

      } catch (error) {
        console.error("Error al conectar con MetaMask:", error);
      }
    } else {
      console.error("MetaMask no está instalado");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Conectar MetaMask (Wanchain Testnet)</button>
      {account() && <p>Cuenta conectada: {account()}</p>}
    </div>
  );
};

export default ConnectMetaMask;
