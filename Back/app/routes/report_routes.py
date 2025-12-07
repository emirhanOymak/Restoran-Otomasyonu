from flask import Blueprint, jsonify
from app.services.report_service import get_dashboard_stats

report_bp = Blueprint('report', __name__, url_prefix='/api/report')

@report_bp.route('/dashboard', methods=['GET'])
def dashboard():
    try:
        veriler = get_dashboard_stats()
        return jsonify(veriler), 200
    except Exception as e:
        print(e)
        return jsonify({"hata": str(e)}), 500