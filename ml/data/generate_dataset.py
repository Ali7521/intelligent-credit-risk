"""
Synthetic Credit Risk Dataset Generator
Generates realistic financial loan applicant records with statistical properties
aligned with credit bureau distributions (FICO/CIBIL, DTI ratios, default events).
"""

import os
import numpy as np
import pandas as pd

def generate_credit_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # 1. Age: Truncated normal between 20 and 70
    age = np.clip(np.random.normal(38, 11, n_samples).astype(int), 21, 72)
    
    # 2. Employment Type
    emp_types = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Contract', 'Unemployed']
    emp_probs = [0.55, 0.20, 0.12, 0.08, 0.03, 0.02]
    employment_type = np.random.choice(emp_types, size=n_samples, p=emp_probs)
    
    # 3. Years of Employment (correlated with age)
    max_years = np.maximum(0, age - 20)
    years_of_employment = np.round(np.clip(np.random.beta(2, 5, n_samples) * max_years, 0, 40), 1)
    years_of_employment[employment_type == 'Unemployed'] = 0.0
    
    # 4. Monthly Income (log-normal distribution)
    base_income = np.random.lognormal(mean=8.4, sigma=0.65, size=n_samples) # around 2,500 - 15,000
    income_mult = {
        'Salaried': 1.0,
        'Self-Employed': 1.15,
        'Business Owner': 1.45,
        'Freelancer': 0.85,
        'Contract': 0.90,
        'Unemployed': 0.20
    }
    monthly_income = np.array([round(inc * income_mult[emp], 2) for inc, emp in zip(base_income, employment_type)])
    monthly_income = np.clip(monthly_income, 800, 45000)
    
    # 5. Monthly Expenses (40% to 75% of income with noise)
    expense_ratio = np.clip(np.random.normal(0.55, 0.12, n_samples), 0.25, 0.90)
    monthly_expenses = np.round(monthly_income * expense_ratio, 2)
    
    # 6. Credit Score (300 to 850 FICO distribution - bi-modal or skewed normal centered ~680)
    credit_score = np.clip(np.random.normal(670, 75, n_samples).astype(int), 320, 850)
    # Penalize unemployed or very low income
    credit_score[employment_type == 'Unemployed'] = np.clip(credit_score[employment_type == 'Unemployed'] - 80, 300, 620)
    
    # 7. Credit History Length (correlated with age)
    max_history = np.maximum(1, age - 18)
    credit_history_length = np.round(np.clip(np.random.beta(2.5, 4, n_samples) * max_history, 0.5, 35), 1)
    
    # 8. Number of Previous Loans & Active Loans
    num_previous_loans = np.random.poisson(lam=2.5, size=n_samples)
    num_active_loans = np.array([min(prev, np.random.poisson(lam=1.2)) for prev in num_previous_loans])
    
    # 9. Existing Debt & EMI
    existing_debt = np.round(num_active_loans * np.random.uniform(2000, 25000, n_samples), 2)
    existing_emi = np.round(existing_debt * np.random.uniform(0.02, 0.045, n_samples), 2)
    
    # 10. Savings Amount (correlated with income, credit score)
    savings_factor = np.random.exponential(scale=3.5, size=n_samples)
    savings_amount = np.round(monthly_income * savings_factor * (credit_score / 600.0), 2)
    
    # 11. Credit Utilization (0 to 100%, inversely correlated with credit score)
    base_util = (850 - credit_score) / 550.0 * 70.0 + np.random.normal(0, 15, n_samples)
    credit_utilization = np.round(np.clip(base_util, 5.0, 98.0), 1)
    
    # 12. Late payments and defaults (strongly tied to credit score and utilization)
    late_prob = np.clip((800 - credit_score) / 600.0 + (credit_utilization / 150.0), 0.05, 0.85)
    num_late_payments = np.random.binomial(n=6, p=late_prob * 0.4)
    
    def_prob = np.clip((720 - credit_score) / 800.0 + (num_late_payments * 0.1), 0.0, 0.7)
    num_previous_defaults = np.random.binomial(n=3, p=def_prob * 0.25)
    
    # 13. Requested Loan Amount & Tenure
    loan_purposes = [
        'Debt Consolidation', 'Home Improvement', 'Business Venture', 
        'Education', 'Medical Emergency', 'Auto Purchase', 'Personal'
    ]
    loan_purpose = np.random.choice(loan_purposes, size=n_samples, p=[0.28, 0.18, 0.14, 0.12, 0.10, 0.10, 0.08])
    
    requested_loan_amount = np.round(np.random.lognormal(mean=9.5, sigma=0.75, size=n_samples), -2) # ~$5,000 - $60,000
    requested_loan_amount = np.clip(requested_loan_amount, 2000, 150000)
    
    tenures = [12, 24, 36, 48, 60, 84]
    loan_tenure = np.random.choice(tenures, size=n_samples, p=[0.10, 0.25, 0.35, 0.15, 0.10, 0.05])
    
    # 14. Calculate Ground Truth Default Probability using calibrated logit model
    # Financial Ratios
    new_emi = requested_loan_amount / loan_tenure
    dti = (existing_emi + new_emi) / np.maximum(monthly_income, 1.0)
    lti = requested_loan_amount / np.maximum(monthly_income * 12.0, 1.0)
    savings_to_loan = savings_amount / np.maximum(requested_loan_amount, 1.0)
    
    # Latent risk score calculation (log-odds of default)
    # Positive weights increase risk of default, negative weights decrease risk
    z = (
        - 1.55                                               # Intercept (baseline default ~ 16-20%)
        - 0.009 * (credit_score - 650)                      # High credit score strongly protective
        + 2.8 * (dti - 0.40)                                # High DTI increases risk
        + 0.035 * (credit_utilization - 40.0)               # High utilization increases risk
        + 0.65 * num_previous_defaults                      # Prior defaults is a red flag
        + 0.35 * num_late_payments                          # Delinquencies
        - 0.45 * np.log1p(savings_to_loan)                  # Savings cushion reduces risk
        - 0.06 * np.minimum(years_of_employment, 15)        # Employment tenure stability
        + 0.50 * (employment_type == 'Unemployed').astype(int)
        + 0.20 * (employment_type == 'Freelancer').astype(int)
        + 0.30 * (loan_purpose == 'Debt Consolidation').astype(int)
        - 0.15 * (credit_history_length / 10.0)             # Credit age
        + 0.015 * np.maximum(0, age - 60)                   # Senior risk adjustment
        + np.random.normal(0, 0.4, n_samples)               # Unobserved stochastic market factors
    )
    
    default_prob = 1.0 / (1.0 + np.exp(-z))
    loan_default = (np.random.uniform(0, 1, n_samples) < default_prob).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'monthly_income': monthly_income,
        'employment_type': employment_type,
        'years_of_employment': years_of_employment,
        'monthly_expenses': monthly_expenses,
        'existing_debt': existing_debt,
        'existing_emi': existing_emi,
        'requested_loan_amount': requested_loan_amount,
        'loan_tenure': loan_tenure,
        'credit_score': credit_score,
        'credit_history_length': credit_history_length,
        'number_of_previous_loans': num_previous_loans,
        'number_of_previous_defaults': num_previous_defaults,
        'number_of_late_payments': num_late_payments,
        'credit_utilization': credit_utilization,
        'number_of_active_loans': num_active_loans,
        'savings_amount': savings_amount,
        'loan_purpose': loan_purpose,
        'loan_default': loan_default
    })
    
    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(data_dir, 'credit_risk_dataset.csv')
    df = generate_credit_dataset(n_samples=5000, random_state=42)
    df.to_csv(output_path, index=False)
    print(f"Generated realistic dataset with {len(df)} rows saved to: {output_path}")
    print(f"Default rate: {df['loan_default'].mean():.2%}")
    print("Class distribution:")
    print(df['loan_default'].value_counts())
