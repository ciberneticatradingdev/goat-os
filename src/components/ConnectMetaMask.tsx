import { createSignal, onMount } from "solid-js";
import { ethers } from "ethers";

const ConnectMetaMask = () => {
  const [account, setAccount] = createSignal<string | null>(null);
  const [authorizationMessage, setAuthorizationMessage] = createSignal<string | null>(null);

  const checkAuthToken = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAccount(data.account);
          setAuthorizationMessage("Autenticado");
        } else {
          localStorage.removeItem("auth_token");
          setAuthorizationMessage("Token inválido o expirado, por favor vuelva a iniciar sesión.");
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
  
        const message = "Iniciar sesión en Wanchain Testnet - Sesión válida por 1 hora";
        const signature = await signer.signMessage(message);
  
        const requestBody = { account: accounts[0], signature, message };
  
        console.log('Request Body being sent:', requestBody);
  
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccount(accounts[0]);
          localStorage.setItem("auth_token", data.token);
          setAuthorizationMessage("Autenticado");
        } else {
          const errorText = await response.text();
          console.error("Error al iniciar sesión:", errorText);
        }
      } catch (error) {
        console.error("Error al conectar con MetaMask:", error);
      }
    } else {
      console.error("MetaMask no está instalado");
    }
  };
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      console.log("El componente se ha montado en el cliente.");
      checkAuthToken();
    }
  });

  return (
    <div>
      <button onClick={connectWallet}>Conectar MetaMask (Wanchain Testnet)</button>
      {account() && <p>Cuenta conectada: {account()}</p>}
      {authorizationMessage() && <p>{authorizationMessage()}</p>}
    </div>
  );
};

export default ConnectMetaMask;
