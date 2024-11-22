const express = require('express');
const client = require('prom-client');
const path = require('path'); // Para manipulação de caminhos

const app = express();
const register = client.register;

// Configuração das métricas
const requestLatency = new client.Histogram({
  name: 'request_latency_seconds',
  help: 'Latência das requisições para /index.html',
  // Ajustando os buckets para latências de 1ms até 1 segundo
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]  // Ajustando para latências mais detalhadas
});

const requestSuccessCount = new client.Counter({
  name: 'request_success_total',
  help: 'Quantidade de requisições com sucesso'
});

const requestErrorCount = new client.Counter({
  name: 'request_error_total',
  help: 'Quantidade de requisições com erro'
});

const requestOver2sCount = new client.Counter({
  name: 'request_over_2_seconds_total',
  help: 'Quantidade de requisições que excederam 2 segundos'
});

const requestConcurrentGauge = new client.Gauge({
  name: 'request_concurrent_total',
  help: 'Número de requisições concorrentes em andamento'
});

// Middleware para coletar as métricas ao acessar o /index.html
app.use(async (req, res, next) => {
  // Condição para garantir que apenas as requisições ao conteúdo principal (http://192.168.15.44) sejam monitoradas
  if (req.path === '/' || req.path === '/index.html') {
    const start = Date.now();
    requestConcurrentGauge.inc();  // Incrementa o número de requisições concorrentes

    res.on('finish', () => {
      const latency = (Date.now() - start) / 1000;  // Latência em segundos
      requestLatency.observe(latency);  // Registra a latência

      if (latency > 2) {
        requestOver2sCount.inc();  // Incrementa se a latência for maior que 2 segundos
      }

      if (res.statusCode === 200) {
        requestSuccessCount.inc();  // Incrementa o contador de sucesso
      } else {
        requestErrorCount.inc();  // Incrementa o contador de erro
      }

      requestConcurrentGauge.dec();  // Decrementa o número de requisições concorrentes
    });
  }
  
  next();
});

// Servir arquivos estáticos da pasta onde está o index.html
app.use(express.static(path.join(__dirname, 'public')));  // Adapte para o diretório correto, se necessário

// Rota principal ("/") que serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // especifica o caminho para o index.html
});

// Endpoint /metrics para expor as métricas no formato que o Prometheus pode coletar
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Inicializando o servidor na porta 5000 (ou qualquer outra porta disponível)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
