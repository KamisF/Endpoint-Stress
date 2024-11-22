# Endpoint-Stress
A project that monitors an Express server with Prometheus and Grafana. It tracks request latency, success/errors, and concurrency. Load testing is done using k6 for performance analysis. Metrics are visualized in Grafana dashboards for real-time insights and optimization.

# Latency Monitoring and Metrics Project with Prometheus and Grafana

This project aims to collect and monitor HTTP request latency metrics for the `/index.html` endpoint of an Express server, using Prometheus for metrics collection and Grafana for visualization. The project includes configuration for metrics such as latency, successful requests, errors, requests exceeding 2 seconds, and concurrent requests.

## 🚀 Technologies

- **Node.js** with **Express**: For creating the server and handling requests.
- **Prometheus**: For metrics collection.
- **Grafana**: For metrics visualization.
- **Prometheus Client for Node.js**: For exposing metrics in a format Prometheus can collect.

## 📦 Installation

### 1. Prerequisites

Ensure you have the following software installed:

- **Node.js** and **npm** (Node Package Manager)
- **Prometheus**
- **Grafana**

### 2. Install project dependencies

Clone the repository or download the code to your machine and follow the instructions below:

```bash
git clone https://github.com/KamisF/Endpoint-Stress.git
cd Endpoint-Stress
npm install
```

This will install all the necessary dependencies for the project, including express, prom-client, and axios.

### 3. Install Prometheus
Download the latest version of Prometheus for your operating system from Prometheus Downloads.

After downloading, extract the contents to a folder and create a prometheus.yml file inside that folder with the following configuration:

```
global:
  scrape_interval: 15s  # Interval for scraping metrics
  scrape_timeout: 10s   # Timeout for scraping

scrape_configs:
  - job_name: 'express-metrics'
    static_configs:
      - targets: ['localhost:5000']  # URL where the Express server will run
```

### 4. Install Grafana
Download and install Grafana from the official site: Grafana Downloads.

After installation, start Grafana and access the web interface at http://localhost:3000. The default login is:

Username: admin
Password: admin

### 5. Install k6
Install k6 from its official documentation. For example, on macOS with Homebrew:

```
brew install k6
```

Or for Linux:

```
sudo apt install k6

```

## 🏃‍♀️ Running the Project
### 1. Start the Express server
After installing the dependencies, start the Express server with the command:

```
npm start
```

This will start the server on port 5000, and the /metrics endpoint will be available for Prometheus to scrape metrics.

### 2. Start Prometheus
Inside the folder where Prometheus was extracted, run the following command:

```
./prometheus --config.file=prometheus.yml
```

This will start Prometheus, which will begin collecting the metrics exposed by the Express server.

### 3. Configure Grafana
1. Access Grafana at http://localhost:3000 and log in with the default credentials.

2. Add Prometheus as a data source:

Click on "Add data source."
Select "Prometheus."
Under the "HTTP" section, configure the Prometheus URL: http://localhost:9090.
Click "Save & Test" to test the connection.

3. Create a dashboard in Grafana:

Go to "Create" and then "Dashboard."
Click "Add a new panel."
In the "Query" field, write the desired query, such as:

```
rate(request_latency_seconds_count[5m])
```

Add additional panels for other metrics you want to visualize, such as latency, request counts, and errors.

### 4. Perform Load Testing with k6
Inside the project folder, you will find a script.js file for the k6 load testing script. Here's an example of what the script might look like:

```
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up to 100 users
    { duration: '5m', target: 100 }, // Hold at 100 users
    { duration: '2m', target: 0 },   // Ramp-down to 0 users
  ],
};

export default function () {
  http.get('http://localhost:5000/index.html');
  sleep(1);
}
```

Run the load test with the following command:

```
k6 run --out experimental-prometheus-rw=http://localhost:9091 script.js
```

This will simulate multiple virtual users (VUs) accessing the endpoint, generating load on the server.

## 🔧 Prometheus Queries
Here are some Prometheus queries you can use to visualize metrics in Grafana:

Requests per second (rate):
```
rate(request_success_total[5m])
```

Average latency (mean):

```
avg(rate(request_latency_seconds_sum[5m])) / avg(rate(request_latency_seconds_count[5m]))
```

95th percentile latency (p95):

```
histogram_quantile(0.95, rate(request_latency_seconds_bucket[5m]))
```

## 🛠️ Known Issues

- Missing or incorrect metrics in Grafana: If you face issues with metrics not showing correctly in Grafana, check if Prometheus is scraping metrics properly. You can access Prometheus at http://localhost:9090 and query the metrics directly.

- Connection failure with Prometheus: Ensure both Prometheus and the Express server are running on the correct ports and there are no conflicts.

- Don't forget: everywhere you see 'http://192.168.15.44', replace it with 'http://localhost'.

Enjoy your latency monitoring system! 🎉 If you encounter any issues, feel free to open an issue in the repository.
