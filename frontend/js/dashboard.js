document.addEventListener("DOMContentLoaded", () => {
    
  // ==========================================
  // 1. INTERATIVIDADE DO MENU FLUTUANTE
  // ==========================================
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault(); // Evita recarregar a página se for link vazio
          
          // Remove a classe 'active' de todos os itens
          navItems.forEach(nav => nav.classList.remove('active'));
          
          // Adiciona a classe 'active' apenas ao item clicado
          this.classList.add('active');
      });
  });

  // ==========================================
  // 2. BUSCA E RENDERIZAÇÃO DE DADOS (API)
  // ==========================================
  
  const carregarDadosDashboard = async () => {
      try {
          /* 
           * AQUI ENTRA A SUA LIGAÇÃO COM O BACKEND (FastAPI):
           * const response = await axios.get('http://localhost:8000/api/dashboard');
           * const dados = response.data;
           */
           
          // DADOS SIMULADOS (Mock) com base na imagem do SafraScan
          const dadosAPI = {
              sensores: [
                  { nome: "Sensor 01", status: "online" },
                  { nome: "Sensor 02", status: "offline" },
                  { nome: "Sensor 03", status: "online" }
              ],
              medias: {
                  solo: { umidade: "78%", temperatura: "33°C" },
                  ar: { umidade: "47%", temperatura: "29°C", luminosidade: "1 lx" }
              }
          };

          atualizarInterface(dadosAPI);

      } catch (error) {
          console.error("Erro ao carregar os dados do dashboard:", error);
      }
  };

  const atualizarInterface = (dados) => {
      // --- Atualizar Lista de Sensores Dinamicamente ---
      const listaSensores = document.querySelector('.sensor-list');
      
      if (listaSensores) {
          listaSensores.innerHTML = ''; // Limpa a lista estática do HTML
          
          dados.sensores.forEach(sensor => {
              const isOnline = sensor.status === 'online';
              const classeStatus = isOnline ? 'online' : 'offline';
              const textoStatus = isOnline ? '• On-line' : '• Off-line';
              
              // Cria o elemento para cada sensor
              const divSensor = document.createElement('div');
              divSensor.className = 'sensor-item';
              divSensor.innerHTML = `
                  <span>${sensor.nome}</span>
                  <span class="status ${classeStatus}">${textoStatus}</span>
              `;
              
              listaSensores.appendChild(divSensor);
          });
      }

      // Caso queira atualizar os dados de Solo e Ar dinamicamente no futuro:
      // document.getElementById('solo-umidade').innerText = `Umidade: ${dados.medias.solo.umidade}`;
  };

  // Inicializa a recolha de dados ao carregar a página
  carregarDadosDashboard();
});