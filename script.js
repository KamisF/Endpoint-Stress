console.log("Site carregado com sucesso!");

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // número de usuários virtuais
  duration: '1m', // duração do teste
};

export default function () {
  let res = http.get('http://192.168.15.44:5000/index.html');
  check(res, {
    'status foi 200': (r) => r.status === 200,
    'tempo de resposta < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
        
    