from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from datasets import load_dataset

app = Flask(__name__)
CORS(app)

print("Loading dataset... (Please wait)")
dataset = load_dataset("lukebarousse/data_jobs", split='train')

print("Converting data to Pandas...")
df = dataset.to_pandas() 
print("Dataset loaded successfully!")

@app.route('/api/trends', methods=['GET'])
def get_trends():
    # 1. Top 5 Job Titles for the Bar Chart
    top_titles = df['job_title_short'].value_counts().head(5)
    chart_data = [{"name": str(title), "value": int(count)} for title, count in top_titles.items()]
    
    # 2. Total Job Postings (Count of all rows)
    total_jobs = int(len(df))
    
    # 3. Average Salary (Calculate mean of 'salary_year_avg', ignoring missing values)
    avg_salary = int(df['salary_year_avg'].dropna().mean())
    
    # 4. Active Companies (Count of unique company names)
    active_companies = int(df['company_name'].nunique())
    
    # Dono cheezein (Chart data aur Summary Stats) JSON mein bhej rahe hain
    return jsonify({
        "top_skills_chart": chart_data,
        "summary_stats": {
            "total_jobs": total_jobs,
            "average_salary": avg_salary,
            "active_companies": active_companies,
            "market_growth": "8.4%" # Isko abhi dummy rakha hai kyunke iske liye purane saal ka data chahiye
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)