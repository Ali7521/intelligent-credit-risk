# AI CreditGuard – Intelligent Credit Risk Assessment System

> **A professional, full-stack fintech web application leveraging machine learning, class-imbalance mitigation, and SHAP explainability to assess loan applicant credit risk.**

---

## 📌 Executive Summary

**AI CreditGuard** is an end-to-end credit risk assessment system built for transparent, accountable lending decision support. Rather than relying on black-box predictions or naive accuracy, AI CreditGuard implements an enterprise-grade ML pipeline that compares **Logistic Regression**, **Random Forest**, and **XGBoost**, balances minority default events using **SMOTE**, and generates local mathematical feature attribution using **SHAP (Shapley Additive Explanations)**.

### Core Workflow
```
[User / Underwriter]
        │
        ▼
[Applicant Form (5-Step Intake)]
        │
        ▼
[Pydantic Data Validation & Financial Ratio Engineering]
        │
        ▼
[Imbalance-Aware ML Inference Engine (SMOTE + Champion Model)]
        │
        ▼
[Risk Prediction: Score (0-100), Default Prob (%), Risk Tier]
        │
        ▼
[Explainable AI: Local SHAP Decomposition & Factors]
        │
        ▼
[Risk Dossier & Portfolio Analytics Dashboard]
```

---

## 🏗️ Project Architecture & Directory Structure

```
creditguard/
│
├── frontend/                     # React + Vite + Tailwind CSS + Recharts UI
│   ├── src/
│   │   ├── charts/               # Reusable Recharts (SHAP Impact, Confusion Matrix)
│   │   │   ├── ShapFeatureImpactChart.jsx
│   │   │   └── ConfusionMatrixCard.jsx
│   │   ├── components/           # Core UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   └── RiskScoreGauge.jsx
│   │   ├── pages/                # 7 Full-featured Application Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AssessmentPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ModelPerformancePage.jsx
│   │   │   └── ResponsibleAiPage.jsx
│   │   ├── services/             # Axios API client
│   │   │   └── api.js
│   │   ├── App.jsx               # Router & Layout
│   │   ├── index.css             # Tailwind base & utilities
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # FastAPI Python Application
│   ├── main.py                   # FastAPI entrypoint, middleware, routers
│   ├── database/                 # SQLAlchemy ORM, engine & models
│   │   ├── connection.py         # PostgreSQL support with auto SQLite fallback
│   │   └── models.py             # ApplicationRecord database schema
│   ├── routes/                   # Clean RESTful API endpoints
│   │   ├── predict.py            # POST /api/predict (Inference + SHAP)
│   │   ├── applications.py       # CRUD & pagination for assessed applications
│   │   ├── dashboard.py          # GET /api/dashboard (Portfolio analytics)
│   │   └── metrics.py            # GET /api/model-metrics (Benchmarking)
│   ├── schemas/                  # Pydantic validation & schemas
│   │   └── applicant.py
│   └── services/                 # Core ML Inference & SHAP service
│       └── ml_service.py
│
├── ml/                           # Real Machine Learning Pipeline
│   ├── data/
│   │   ├── generate_dataset.py   # Realistic credit distribution generator
│   │   ├── credit_risk_dataset.csv
│   │   └── seed_db.py            # Initial portfolio benchmark seeder
│   ├── preprocessing/
│   │   └── pipeline.py           # Feature engineering, scaling & encoders
│   ├── training/
│   │   └── train.py              # Training, SMOTE, evaluation & SHAP persistence
│   ├── evaluation/
│   │   └── evaluate.py           # Standalone verification runner
│   └── saved_models/             # Persisted joblib models & JSON metrics
│       ├── best_model.joblib
│       ├── preprocessor.joblib
│       ├── shap_background.joblib
│       ├── model_metrics.json
│       └── feature_names.json
│
├── tests/
│   ├── run_tests.py              # Comprehensive integration test runner
│   └── test_api.py               # Unit tests
│
├── docker-compose.yml            # PostgreSQL container config
├── requirements.txt              # Backend & ML dependencies
├── .env.example                  # Environment configuration template
└── README.md                     # Documentation
```

---

## 🤖 Machine Learning Pipeline & Empirical Benchmarks

### 1. Features Ingested & Engineered
* **Raw Demographics & Earnings**: `age`, `monthly_income`, `employment_type`, `years_of_employment`, `monthly_expenses`.
* **Liabilities & Solvency**: `existing_debt`, `existing_emi`, `savings_amount`.
* **Credit Bureau History**: `credit_score` (300–850), `credit_history_length`, `number_of_previous_loans`, `number_of_previous_defaults`, `number_of_late_payments`, `credit_utilization` (0–100%), `number_of_active_loans`.
* **Loan Facility Request**: `requested_loan_amount`, `loan_tenure`, `loan_purpose`.
* **Engineered Domain Indicators**:
  * **Debt-to-Income (DTI)**: $(Existing\ EMI + New\ EMI) / Monthly\ Income$
  * **Expense-to-Income**: $Monthly\ Expenses / Monthly\ Income$
  * **Loan-to-Income (LTI)**: $Requested\ Loan / (Monthly\ Income \times 12)$
  * **Savings-to-Loan Cushion**: $Savings\ Amount / Requested\ Loan$
  * **Total Debt Burden**: $(Existing\ Debt + Requested\ Loan) / (Monthly\ Income \times 12)$

### 2. Model Comparison & Benchmark Results
Evaluated on a held-out 20% stratified test split ($N = 1,000$ test records):

| Algorithm | Accuracy | Precision (Class 1) | Recall (Defaults) | F1-Score | ROC-AUC | PR-AUC | False Negatives (Missed Defaults) | Selection Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (SMOTE)** | 78.30% | 33.68% | **77.42%** | **0.4694** | **0.8635** | **0.5265** | **28 missed** | **🏆 Champion** |
| **XGBoost (Weighted)** | 83.90% | 40.11% | 60.48% | 0.4823 | 0.8393 | 0.4968 | 49 missed | Candidate |
| **Random Forest (Balanced)** | **85.50%** | **43.14%** | 53.23% | 0.4765 | 0.8496 | 0.4938 | 58 missed | Candidate |

### 3. Why Accuracy Alone is Insufficient in Credit Risk
In retail lending, default rates typically range between 10% and 15%. A naive model that classifies every borrower as "Non-Default" achieves **88% accuracy**, yet has **0% default recall**, causing catastrophic institutional loan losses.

In credit economics:
* **False Positive (Type I)**: Declining a prime borrower loses modest interest margin ($\approx \$800$).
* **False Negative (Type II)**: Approving a borrower who defaults loses the entire unpaid principal balance ($\approx \$25,000+$).

Because False Negatives are dramatically more damaging, the pipeline selects the model using a **Loss-Weighted Composite Metric** prioritizing **Default Recall (77.42%)** and **PR-AUC (0.5265)**.

---

## 🔍 Explainable AI (SHAP)

Every prediction computes real-time local Shapley Additive Explanations:
1. **Risk Increasing Factors**: Quantifies features pushing default probability upward (e.g., *High credit utilization: 88%*, *DTI > 60%*, *Prior defaults: 2*).
2. **Risk Mitigating Factors**: Quantifies features buffering creditworthiness (e.g., *Credit score: 780*, *Employment tenure: 9.5 yrs*, *Healthy savings cushion*).
3. **Horizontal Waterfall / Bar Chart**: Renders each feature's contribution in standard deviation impacts.
4. **Interpretability Notice**: Clearly notes that these represent statistical model attribution, not guaranteed causal relationships.

---

## 💻 Frontend Application Pages (React + Vite + Tailwind)

1. **Landing Page (`/`)**: Enterprise fintech landing page with hero overview, real-time KPI counter, end-to-end workflow explanation, and model benchmark highlights.
2. **Credit Assessment Page (`/assess`)**: Beautiful 5-step form (Personal Info, Employment & Income, Debt & Expenses, Credit History, Loan Request) with domain validation, real-time DTI calculator, and 1-click **Demo Profile Presets** (*Prime*, *Near-Prime*, *Subprime*).
3. **Prediction Result Page (`/result`)**: Displays the prominent **CREDIT RISK** card with animated score gauge, default probability, institutional review guidance, top risk factors, top positive factors, and interactive horizontal SHAP chart.
4. **Applications Dashboard (`/dashboard`)**: Full portfolio ledger featuring search, tier filters (*Low Risk*, *Medium Risk*, *High Risk*), and an in-depth **Audit Dossier Modal**.
5. **Portfolio Analytics (`/analytics`)**: Macro analytics with 6 Recharts visualizations (Risk Category Donut, Default Prob Histogram, Credit Score vs Risk, Income vs Risk, DTI Escalation Curve, and Global Feature Importance).
6. **Model Performance Page (`/models`)**: Benchmark evaluation center with side-by-side Confusion Matrices, multi-model ROC Curves, and Precision-Recall Curves.
7. **Responsible AI & Governance (`/responsible-ai`)**: Dedicated ethics page detailing protected attributes exclusion, bias mitigation, SHAP explainability, and human-in-the-loop review.

---

## 🛡️ Responsible AI & Governance

* **Exclusion of Protected Attributes**: Race, ethnicity, religion, caste, tribe, gender, marital status, and age-discrimination proxies are strictly excluded from predictive features.
* **Human-in-the-Loop Policy**: The application intentionally does **NOT** issue automatic "Loan Approved" or "Loan Rejected" verdicts. Predictions are classified as risk tiers (*LOW RISK*, *MEDIUM RISK*, *HIGH RISK*) with institutional guidance (*"High predicted default risk — requires further human/institutional review"*).
* **Educational Prototype Disclaimer**:
  > *"This application is an educational AI prototype. Its predictions should not be used as the sole basis for real-world lending or financial decisions."*

---

## 🚀 Setup & Execution Instructions

### Prerequisites
* Python 3.9+ (Python 3.11 / 3.12 / 3.14 supported)
* Node.js v18+ & npm
* (Optional) PostgreSQL or Docker

---

### Step 1: Clone and Navigate to Project
```bash
cd /Users/ali/creditguard
```

### Step 2: Backend Setup & ML Pipeline Execution
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Generate or verify the dataset:
```bash
python ml/data/generate_dataset.py
```

3. Train and compare models (Logistic Regression, Random Forest, XGBoost):
```bash
python ml/training/train.py
```
*(This automatically executes SMOTE resampling, evaluates all 3 models across all 7 metrics, selects the champion model, fits the SHAP explainer, and writes artifacts to `ml/saved_models/`).*

4. Seed initial historical demo applications into the database:
```bash
python ml/data/seed_db.py
```

5. Launch FastAPI backend:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The API is now live at: `http://localhost:8000` (Interactive Swagger docs: `http://localhost:8000/docs`).

---

### Step 3: Frontend Setup & Execution
1. Open a new terminal and navigate to `frontend`:
```bash
cd frontend
npm install
```

2. Start the Vite development server:
```bash
npm run dev
```
The web application is now accessible at: `http://localhost:5173`.

---

## 🧪 Testing Instructions

Run the complete backend integration and API unit test suite:
```bash
python tests/run_tests.py
```

The test suite validates:
* `GET /api/health`: Service health and operational status
* `POST /api/predict`: Validates input ranges, executes inference, and asserts SHAP factors
* `POST /api/predict`: Asserts boundary validation errors (e.g. credit score < 300)
* `POST /api/applications`: Full assessment persistence and ID generation
* `GET /api/applications/{id}`: Retrieval of audited underwriting dossiers
* `GET /api/dashboard`: Aggregation of portfolio metrics and chart series
* `GET /api/model-metrics`: Benchmark metrics comparison for all 3 models

---

## 🔌 API Reference Highlights

### `POST /api/predict`
**Request Body:**
```json
{
  "age": 35,
  "monthly_income": 7500.0,
  "employment_type": "Salaried",
  "years_of_employment": 6.0,
  "monthly_expenses": 3200.0,
  "existing_debt": 8000.0,
  "existing_emi": 350.0,
  "requested_loan_amount": 20000.0,
  "loan_tenure": 36,
  "credit_score": 760,
  "credit_history_length": 10.0,
  "number_of_previous_loans": 3,
  "number_of_previous_defaults": 0,
  "number_of_late_payments": 0,
  "credit_utilization": 22.0,
  "number_of_active_loans": 1,
  "savings_amount": 18000.0,
  "loan_purpose": "Home Improvement"
}
```

**Response Body:**
```json
{
  "risk_score": 91,
  "risk_category": "LOW RISK",
  "default_probability": 0.0907,
  "default_probability_percentage": 9.1,
  "risk_factors": [
    "Expense-to-Income Ratio (+0.14 model weight)",
    "Limited liquid emergency savings cushion ($18,000)"
  ],
  "positive_factors": [
    "Strong Credit Score rating (760)",
    "Repeated late payment delinquency (0 occurrences)",
    "Healthy Debt-to-Income ratio (17.6%)",
    "Stable long-term employment (6.0 yrs tenure)"
  ],
  "feature_impacts": [
    {
      "feature_id": "credit_score",
      "feature_name": "Credit Score (FICO/CIBIL)",
      "impact": -0.421,
      "raw_value": 760,
      "is_risk_increasing": false
    }
  ],
  "financial_ratios": {
    "debt_to_income": 0.176,
    "expense_to_income": 0.426,
    "loan_to_income": 0.222,
    "savings_to_loan": 0.9,
    "credit_burden_ratio": 0.311
  },
  "review_recommendation": "Low predicted default risk — applicant profile meets institutional baseline criteria, subject to formal identity and income verification.",
  "review_action": "Standard Processing"
}
```

---

## 🗄️ Database Configuration (PostgreSQL & SQLite)

By default, the system includes automatic fallback to local SQLite (`sqlite:///./creditguard.db`) so it runs immediately out of the box with zero external configuration.

To connect to **PostgreSQL**:
1. Run Postgres locally or with Docker:
```bash
docker-compose up -d
```
2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/creditguard
```
3. Restart the backend. SQLAlchemy automatically migrates and initializes tables.

---

## 🎓 Academic & Portfolio Highlights

This project demonstrates:
1. **Applied Machine Learning**: Supervised classification under class imbalance (SMOTE) with multi-model benchmarking.
2. **Explainable AI (XAI)**: Game-theoretic SHAP local attribution translated into human-readable credit factors.
3. **Enterprise System Design**: Production FastAPI service, Pydantic validation, SQLAlchemy ORM, and React Vite frontend.
4. **Fintech Domain Acumen**: Knowledge of credit economics, loss asymmetry (False Negatives vs False Positives), DTI/LTI financial ratios, and regulatory compliance (ECOA, FCRA, GDPR).
