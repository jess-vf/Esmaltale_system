/**
 * data.js
 * Base de dados local dos materiais.
 * Em produção, substituir por chamadas à API.
 */

const AppData = {
  alicates: [
    { id: 'ALC-001', marca: 'Mundial 5mm',    shop: 'Shopping Bela Vista', func: 'Carol Santos',  data: '12/01/2024', status: 'Em uso',      obs: 'Alicate de cutículas, bom estado' },
    { id: 'ALC-002', marca: 'Staleks Pro',     shop: 'Shopping Barra',      func: 'Juliana Melo',  data: '03/03/2024', status: 'Em uso',      obs: '—' },
    { id: 'ALC-003', marca: 'Clivagem X',      shop: 'Alameda Shopping',    func: '—',             data: '18/06/2023', status: 'Manutenção', obs: 'Mola com defeito, aguardando peça' },
    { id: 'ALC-004', marca: 'Mundial 4mm',     shop: 'Shopping Bela Vista', func: 'Patrícia Lima', data: '22/09/2024', status: 'Em uso',      obs: '—' },
    { id: 'ALC-005', marca: 'Staleks Classic', shop: 'Shopping Barra',      func: '—',             data: '07/11/2024', status: 'Disponível', obs: 'Reserva' },
  ],
  canetas: [
    { id: 'CAN-001', marca: 'Caneta Elétrica XP', shop: 'Shopping Bela Vista', func: 'Carol Santos', data: '05/02/2024', status: 'Em uso',      obs: '—' },
    { id: 'CAN-002', marca: 'Caneta Pro 3000',     shop: 'Alameda Shopping',    func: 'Juliana Melo', data: '15/04/2024', status: 'Disponível', obs: '—' },
    { id: 'CAN-003', marca: 'Caneta Premium',      shop: 'Shopping Barra',      func: '—',            data: '10/08/2023', status: 'Manutenção', obs: 'Cabo com defeito' },
  ],
  motores: [
    { id: 'MOT-001', marca: 'Strong 210', shop: 'Shopping Bela Vista', func: 'Carol Santos',  data: '10/01/2024', status: 'Em uso',      obs: '—' },
    { id: 'MOT-002', marca: 'Micro Pro',  shop: 'Shopping Barra',      func: 'Juliana Melo',  data: '22/03/2024', status: 'Manutenção', obs: 'Revisão periódica' },
    { id: 'MOT-003', marca: 'Turbo X',   shop: 'Alameda Shopping',    func: 'Patrícia Lima', data: '05/07/2024', status: 'Disponível', obs: '—' },
  ],
  cabines: [
    { id: 'CAB-001', marca: 'Cabine LED 36W', shop: 'Shopping Bela Vista', func: 'Carol Santos', data: '08/02/2024', status: 'Em uso',      obs: '—' },
    { id: 'CAB-002', marca: 'Cabine UV Pro',  shop: 'Shopping Barra',      func: '—',            data: '14/05/2024', status: 'Manutenção', obs: 'Lâmpada queimada' },
  ],
  sugadores: [
    { id: 'SUG-001', marca: 'Sugador Lux 80W', shop: 'Alameda Shopping',    func: 'Juliana Melo',  data: '20/03/2024', status: 'Em uso',      obs: '—' },
    { id: 'SUG-002', marca: 'Sugador Pro 60W', shop: 'Shopping Bela Vista', func: 'Patrícia Lima', data: '11/06/2024', status: 'Disponível', obs: '—' },
  ],
};
