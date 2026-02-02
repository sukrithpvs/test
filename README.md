# Portfolio Manager REST API

A Spring Boot REST API for managing stock portfolios with live price integration from Yahoo Finance.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.2**
- **Spring Data JPA**
- **MySQL Database**
- **Lombok**
- **Swagger/OpenAPI 3**
- **Yahoo Finance API**

## Prerequisites

1. **Java 17+** installed
2. **Maven 3.6+** installed
3. **MySQL 8.0+** installed and running

## Database Setup

### Option 1: Create database manually

```sql
CREATE DATABASE portfolio_db;
```

### Option 2: Let the app create it

The connection URL includes `createDatabaseIfNotExist=true`, so the database will be created automatically.

### Database Configuration

Update `src/main/resources/application.yml` if your MySQL credentials differ:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/portfolio_db
    username: root
    password: root
```

## Running the Application

```bash
# Navigate to project directory
cd c:\Users\sukri\Desktop\Project

# Build the project (using Maven wrapper - no Maven installation needed)
.\mvnw.cmd clean install

# Run the application
.\mvnw.cmd spring-boot:run
```

**Note**: If you have Maven installed globally, you can also use:
```bash
mvn clean install
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation (Swagger UI)

Access Swagger UI at: **http://localhost:8080/swagger-ui/index.html**

## API Endpoints

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio` | Create a new portfolio |
| GET | `/api/portfolio` | Get portfolio with all holdings |
| GET | `/api/portfolio/summary` | Get portfolio analytics (P&L) |

### Holdings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/holdings` | List all holdings |
| POST | `/api/holdings` | Add a new holding |
| PUT | `/api/holdings/{id}` | Update a holding |
| DELETE | `/api/holdings/{id}` | Delete a holding |

### Prices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prices/{ticker}` | Get live stock price |

## Sample API Requests

### Create Portfolio
```bash
curl -X POST http://localhost:8080/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{"name": "My Portfolio"}'
```

### Add Holding
```bash
curl -X POST http://localhost:8080/api/holdings \
  -H "Content-Type: application/json" \
  -d '{"ticker": "GOOGL", "quantity": 5, "avgBuyPrice": 140}'
```

### Get Portfolio Summary
```bash
curl http://localhost:8080/api/portfolio/summary
```

### Get Live Price
```bash
curl http://localhost:8080/api/prices/AAPL
```

## Demo Data

On first startup, the application seeds:
- **Portfolio**: "My Portfolio"
- **Holdings**:
  - AAPL: 10 shares @ $150
  - TSLA: 5 shares @ $700
  - AMZN: 2 shares @ $120

## Project Structure

```
src/main/java/com/portfolio/manager/
├── config/
│   ├── CorsConfig.java
│   ├── SwaggerConfig.java
│   └── DataSeeder.java
├── controller/
│   ├── PortfolioController.java
│   ├── HoldingController.java
│   └── PriceController.java
├── dto/
│   ├── request/
│   │   ├── CreatePortfolioRequest.java
│   │   ├── AddHoldingRequest.java
│   │   └── UpdateHoldingRequest.java
│   └── response/
│       ├── PortfolioResponse.java
│       ├── HoldingResponse.java
│       ├── PortfolioSummaryResponse.java
│       └── PriceResponse.java
├── entity/
│   ├── Portfolio.java
│   └── Holding.java
├── exception/
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── GlobalExceptionHandler.java
├── repository/
│   ├── PortfolioRepository.java
│   └── HoldingRepository.java
├── service/
│   ├── PortfolioService.java
│   ├── HoldingService.java
│   ├── YahooFinanceService.java
│   └── PortfolioAnalyticsService.java
└── PortfolioManagerApplication.java
```

## Yahoo Finance Integration

The `YahooFinanceService`:
- Attempts to fetch live prices from Yahoo Finance API
- Falls back to mock prices if API is unavailable
- Includes predefined mock prices for common tickers (AAPL, TSLA, AMZN, GOOGL, MSFT, etc.)
