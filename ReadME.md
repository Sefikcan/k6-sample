K6 test sonuçlarını izlemek için Grafana ile bir dashboard oluşturmak harika bir fikir! K6, Prometheus ve InfluxDB ile entegrasyon yaparak metrikleri görselleştirebilirsin. K6, metrikleri Prometheus veya InfluxDB'ye gönderir ve Grafana bu veritabanlarından metrikleri çekerek gösterir.

İlk olarak, Grafana'da K6 için bir dashboard oluşturmak için adım adım ilerleyelim.
1. K6, Prometheus ve Grafana Docker Compose Yapılandırması
Eğer K6 ile Prometheus ve Grafana kullanıyorsan, Docker Compose dosyanı aşağıdaki gibi düzenleyebilirsin:
``` yaml
version: '3'

services:
  k6:
    image: grafana/k6
    volumes:
      - ./scripts:/scripts
    command: run /scripts/your_test.js
    environment:
      K6_PROMETHEUS_RW_SERVER_URL: "http://prometheus:9090"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```
Bu yapılandırma, K6 metriklerini Prometheus'a gönderir ve Grafana, bu metrikleri Prometheus'tan alır.
2. Prometheus Yapılandırması
Prometheus’un yapılandırmasını yapman gerekiyor. prometheus.yml dosyasında şu ayarları yapmalısın:
``` yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'k6'
    static_configs:
      - targets: ['k6:6565']
```
Bu dosya, Prometheus’un K6’dan veri çekmesini sağlar.

3. Grafana Dashboard'u Ayarlama
Grafana üzerinde K6 test metriklerini görselleştirmek için bir dashboard ekleyebilirsin:

Grafana’yı aç: http://localhost:3000 adresine git.
Prometheus’u Veri Kaynağı Olarak Ekle: Grafana arayüzünde ayarlara gidip Prometheus'u veri kaynağı olarak ekleyebilirsin.
URL: http://prometheus:9090
Dashboard Ekle:
Grafana Dashboard Import bölümüne git.
K6 için hazır bir dashboard kullanabilirsin. Örneğin, Grafana’da popüler bir K6 dashboard'unu import etmek için şu dashboard ID'sini kullanabilirsin: 2587.
Import tıklayıp dashboard'u eklediğinde, K6'nın Prometheus'a gönderdiği metrikleri görebileceksin.
4. K6 Test Scripti
Son olarak, K6 test scriptini uygun şekilde yapılandırmalısın. Örnek bir test scripti şu şekilde olabilir:
``` js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500']
  },
};

export default function () {
  const res = http.get('https://test-api.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
```
5. Daha sonra aşağıdaki komutla influxdb ve grafana'yı ayağa kaldıralım.
``` yaml
docker compose up -d influxdb grafana
```
Son olarak da ilgili load test scriptimizi çalıştırıp load testimizi çalıştıralım.
``` yaml
docker compose run k6 run /scripts/k6_load_test.js
```
* İlk olarak grafanada'da influxdb datasource'unu eklemelisin.
* Grafana üzerinden dashboard->import ile influxdb'yi eklediğimizde otomatik olarak ilgili bilgiler gelecektir.

---

Creating a Grafana dashboard to monitor K6 test results is a great idea! By integrating K6 with Prometheus or InfluxDB, you can visualize your test metrics. K6 sends metrics to Prometheus or InfluxDB, and Grafana pulls the metrics from these databases to display them.

Let’s go step by step to set up a Grafana dashboard for K6.
1. K6, Prometheus, and Grafana Docker Compose Setup
If you're using K6 with Prometheus and Grafana, you can configure your Docker Compose file like this:
``` yaml
version: '3'

services:
  k6:
    image: grafana/k6
    volumes:
      - ./scripts:/scripts
    command: run /scripts/your_test.js
    environment:
      K6_PROMETHEUS_RW_SERVER_URL: "http://prometheus:9090"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

In this setup, K6 sends metrics to Prometheus, and Grafana fetches those metrics from Prometheus.
2. Prometheus Configuration
You need to configure Prometheus to scrape metrics from K6. Create a prometheus.yml configuration file like this:

``` yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'k6'
    static_configs:
      - targets: ['k6:6565']
```

This configuration allows Prometheus to pull metrics from the K6 container.

3. Setting Up Grafana Dashboard
To visualize K6 test metrics on Grafana, you can follow these steps:

Access Grafana: Open http://localhost:3000 in your browser.
Add Prometheus as a Data Source:
In Grafana’s UI, go to Settings and add Prometheus as a data source.
Use the following URL: http://prometheus:9090.
Add Dashboard:
Go to the Dashboard Import section in Grafana.
You can use a pre-built K6 dashboard. For example, to import a popular K6 dashboard, use this dashboard ID: 2587.
Once imported, you’ll be able to see K6 metrics visualized in Grafana.
4. Example K6 Test Script
Here’s an example K6 test script you can use to run performance tests:

``` javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500']
  },
};

export default function () {
  const res = http.get('https://test-api.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
```

5. Next, let's bring up InfluxDB and Grafana with the following command:
``` yml
docker compose up -d influxdb grafana
``` 
Finally, we can run our load test script by executing the following command:
``` yaml
docker compose run k6 run /scripts/k6_load_test.js
```
First, you need to add InfluxDB as a data source in Grafana.
After that, in Grafana, go to Dashboard -> Import, and once you add the InfluxDB data source, the relevant metrics will be automatically populated.