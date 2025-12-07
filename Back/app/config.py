import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv() 

class Config:
    
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_NAME')
    driver = os.getenv('DB_DRIVER')
    trusted_connection = os.getenv('DB_TRUSTED_CONNECTION')
    
    
    if trusted_connection == 'yes':
        conn_str = f'DRIVER={{{driver}}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
    else:
        user = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        conn_str = f'DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    
    params = urllib.parse.quote_plus(conn_str)
    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={params}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False