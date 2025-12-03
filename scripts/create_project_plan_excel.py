"""
Script to create an Excel project plan for Training App Production Deployment
with Microsoft SSO, Foundational/GenAI pathways, mini hands-on, and GitHub capstone submission
"""

import xlsxwriter
from datetime import datetime, timedelta


def create_project_plan():
    """Create the project plan Excel file"""
    
    # Create workbook
    workbook = xlsxwriter.Workbook(
        r'c:\Users\Sarun.LAPTOP-M5IEJDVK\OneDrive - NEULEAP AI PRIVATE LIMITED\Documents\TrainingApp\training-app\Training_App_Production_Project_Plan.xlsx'
    )
    
    # Define formats
    header_format = workbook.add_format({
        'bold': True,
        'font_size': 12,
        'bg_color': '#1F4E79',
        'font_color': 'white',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': True
    })
    
    week_header_format = workbook.add_format({
        'bold': True,
        'font_size': 14,
        'bg_color': '#2E75B6',
        'font_color': 'white',
        'border': 1,
        'align': 'left',
        'valign': 'vcenter'
    })
    
    epic_format = workbook.add_format({
        'bold': True,
        'font_size': 11,
        'bg_color': '#BDD7EE',
        'border': 1,
        'align': 'left',
        'valign': 'vcenter',
        'text_wrap': True
    })
    
    task_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'left',
        'valign': 'vcenter',
        'text_wrap': True
    })
    
    date_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'num_format': 'mmm dd'
    })
    
    number_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter'
    })
    
    priority_p0_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'bg_color': '#FF6B6B',
        'font_color': 'white'
    })
    
    priority_p1_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'bg_color': '#FFC107',
    })
    
    priority_p2_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'bg_color': '#28A745',
        'font_color': 'white'
    })
    
    status_todo_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'bg_color': '#E0E0E0',
    })
    
    summary_format = workbook.add_format({
        'bold': True,
        'font_size': 11,
        'bg_color': '#FFF2CC',
        'border': 1,
        'align': 'left',
        'valign': 'vcenter'
    })
    
    risk_format = workbook.add_format({
        'font_size': 10,
        'border': 1,
        'align': 'left',
        'valign': 'vcenter',
        'text_wrap': True,
        'bg_color': '#FFCCCC'
    })
    
    # ========== SHEET 1: PROJECT BOARD ==========
    board = workbook.add_worksheet('Project Board')
    board.set_column('A:A', 8)   # ID
    board.set_column('B:B', 45)  # Title
    board.set_column('C:C', 12)  # Status
    board.set_column('D:D', 10)  # Type
    board.set_column('E:E', 12)  # Priority
    board.set_column('F:F', 25)  # Labels
    board.set_column('G:G', 10)  # Week
    board.set_column('H:H', 12)  # Start Date
    board.set_column('I:I', 12)  # End Date
    board.set_column('J:J', 8)   # Points
    board.set_column('K:K', 55)  # Description
    board.set_column('L:L', 15)  # Dependencies
    
    # Headers
    headers = ['ID', 'Title', 'Status', 'Type', 'Priority', 'Labels', 'Week', 'Start Date', 'End Date', 'Points', 'Description', 'Dependencies']
    for col, header in enumerate(headers):
        board.write(0, col, header, header_format)
    
    board.freeze_panes(1, 0)
    
    # Data
    row = 1
    
    # ====== WEEK 1 ======
    board.merge_range(row, 0, row, 11, 'WEEK 1: FOUNDATION & AUTHENTICATION (Dec 9-13, 2025)', week_header_format)
    row += 1
    
    # Epic 1: Microsoft SSO
    board.write(row, 0, '1', epic_format)
    board.write(row, 1, 'Microsoft SSO Integration Setup', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'authentication, sso, azure', epic_format)
    board.write(row, 6, 'Week 1', epic_format)
    board.write(row, 7, datetime(2025, 12, 9), date_format)
    board.write(row, 8, datetime(2025, 12, 13), date_format)
    board.write(row, 9, 13, number_format)
    board.write(row, 10, 'Implement Microsoft SSO using MSAL for enterprise authentication', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    # SSO Tasks
    sso_tasks = [
        ('1.1', 'Register Azure AD Application', 'P0', 'Dec 9', 'Dec 9', 2, 'Register app in Azure AD portal, configure redirect URIs, client ID/secret', ''),
        ('1.2', 'Install MSAL Backend Dependencies', 'P0', 'Dec 9', 'Dec 9', 1, 'Add msal, azure-identity packages to requirements.txt', '1.1'),
        ('1.3', 'Create SSO Authentication Endpoint', 'P0', 'Dec 10', 'Dec 10', 3, 'Create /api/auth/sso/login endpoint to initiate SSO flow', '1.2'),
        ('1.4', 'Create SSO Callback Handler', 'P0', 'Dec 10', 'Dec 11', 3, 'Create /api/auth/sso/callback to handle Azure AD response and create JWT', '1.3'),
        ('1.5', 'Update Frontend AuthContext for SSO', 'P0', 'Dec 11', 'Dec 12', 3, 'Modify AuthContext.tsx to support SSO login flow alongside existing auth', '1.4'),
        ('1.6', 'Create SSO Login Button Component', 'P1', 'Dec 12', 'Dec 12', 1, 'Add Microsoft Sign-In button to Login page', '1.5'),
    ]
    
    for task in sso_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'backend, api' if 'Backend' in task[1] or 'Endpoint' in task[1] or 'Callback' in task[1] else 'frontend, ui', task_format)
        board.write(row, 6, 'Week 1', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 2: Pathway Configuration
    board.write(row, 0, '2', epic_format)
    board.write(row, 1, 'Pathway Configuration Setup', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'pathways, database', epic_format)
    board.write(row, 6, 'Week 1', epic_format)
    board.write(row, 7, datetime(2025, 12, 9), date_format)
    board.write(row, 8, datetime(2025, 12, 13), date_format)
    board.write(row, 9, 8, number_format)
    board.write(row, 10, 'Configure database and backend for Foundational and GenAI pathways', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    pathway_tasks = [
        ('2.1', 'Define Pathway Schema', 'P0', 'Dec 9', 'Dec 10', 2, 'Create pathway enum/configuration in database schema', ''),
        ('2.2', 'Create Foundational Track Structure', 'P0', 'Dec 10', 'Dec 11', 2, 'Setup Foundational pathway with subtracks: Python Basics, SQL, Data Analysis', '2.1'),
        ('2.3', 'Create GenAI Track Structure', 'P0', 'Dec 11', 'Dec 12', 2, 'Setup GenAI pathway with subtracks: LLM Fundamentals, Prompt Engineering, RAG', '2.1'),
        ('2.4', 'Create Pathway Selection API', 'P1', 'Dec 12', 'Dec 13', 2, 'API endpoint to get available pathways and assign user to pathway', '2.2, 2.3'),
    ]
    
    for task in pathway_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'backend, database', task_format)
        board.write(row, 6, 'Week 1', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 3: Production Environment
    board.write(row, 0, '3', epic_format)
    board.write(row, 1, 'Production Environment Setup', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'infrastructure, devops', epic_format)
    board.write(row, 6, 'Week 1', epic_format)
    board.write(row, 7, datetime(2025, 12, 9), date_format)
    board.write(row, 8, datetime(2025, 12, 13), date_format)
    board.write(row, 9, 8, number_format)
    board.write(row, 10, 'Prepare production deployment infrastructure', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    infra_tasks = [
        ('3.1', 'Select Cloud Provider & Create Resources', 'P0', 'Dec 9', 'Dec 10', 2, 'Setup Azure/AWS resources: App Service/ECS, PostgreSQL, Redis', ''),
        ('3.2', 'Configure Production Environment Variables', 'P0', 'Dec 10', 'Dec 11', 2, 'Setup production secrets: JWT keys, DB credentials, Azure AD secrets', '3.1'),
        ('3.3', 'Setup CI/CD Pipeline', 'P1', 'Dec 11', 'Dec 12', 3, 'Configure GitHub Actions for automated testing and deployment', '3.2'),
        ('3.4', 'Configure Production Database', 'P0', 'Dec 12', 'Dec 13', 1, 'Setup managed PostgreSQL and FalkorDB instances', '3.1'),
    ]
    
    for task in infra_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'infrastructure, cloud', task_format)
        board.write(row, 6, 'Week 1', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # ====== WEEK 2 ======
    row += 1
    board.merge_range(row, 0, row, 11, 'WEEK 2: HANDS-ON FEATURES & CAPSTONE ENHANCEMENTS (Dec 16-20, 2025)', week_header_format)
    row += 1
    
    # Epic 4: Mini Hands-On Feature
    board.write(row, 0, '4', epic_format)
    board.write(row, 1, 'Mini Hands-On Feature Implementation', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'hands-on, interactive', epic_format)
    board.write(row, 6, 'Week 2', epic_format)
    board.write(row, 7, datetime(2025, 12, 16), date_format)
    board.write(row, 8, datetime(2025, 12, 20), date_format)
    board.write(row, 9, 13, number_format)
    board.write(row, 10, 'Enable interactive mini hands-on exercises within the platform', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    handson_tasks = [
        ('4.1', 'Design Hands-On Data Model', 'P0', 'Dec 16', 'Dec 16', 2, 'Create hands_on table with fields: exercise_id, topic_id, type, content, expected_output', ''),
        ('4.2', 'Create Hands-On API Endpoints', 'P0', 'Dec 16', 'Dec 17', 3, 'Create CRUD endpoints: GET /api/topics/{id}/hands-on, POST /api/hands-on/submit', '4.1'),
        ('4.3', 'Build Code Editor Component', 'P0', 'Dec 17', 'Dec 18', 3, 'Integrate Monaco Editor or CodeMirror for in-browser code editing', '4.2'),
        ('4.4', 'Create Hands-On Exercise Page', 'P0', 'Dec 18', 'Dec 19', 3, 'Build exercise page with instructions, code editor, and submit button', '4.3'),
        ('4.5', 'Implement Code Validation Backend', 'P1', 'Dec 19', 'Dec 20', 2, 'Add simple output validation for hands-on exercises', '4.2'),
    ]
    
    for task in handson_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'backend, api' if 'API' in task[1] or 'Model' in task[1] or 'Backend' in task[1] else 'frontend, ui', task_format)
        board.write(row, 6, 'Week 2', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 5: GitHub Capstone Submission
    board.write(row, 0, '5', epic_format)
    board.write(row, 1, 'GitHub Repository Capstone Submission', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'capstone, github', epic_format)
    board.write(row, 6, 'Week 2', epic_format)
    board.write(row, 7, datetime(2025, 12, 16), date_format)
    board.write(row, 8, datetime(2025, 12, 20), date_format)
    board.write(row, 9, 8, number_format)
    board.write(row, 10, 'Enable GitHub repository link submission for capstone projects', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    capstone_tasks = [
        ('5.1', 'Update Capstone Schema for GitHub Link', 'P0', 'Dec 16', 'Dec 16', 1, 'Add github_repo_url field to capstone submissions table', ''),
        ('5.2', 'Create Capstone Submission API', 'P0', 'Dec 16', 'Dec 17', 2, 'Create POST /api/capstones/{id}/submit endpoint', '5.1'),
        ('5.3', 'Add GitHub URL Validation', 'P1', 'Dec 17', 'Dec 17', 1, 'Validate GitHub URL format and optionally check repo existence', '5.2'),
        ('5.4', 'Create Capstone Submission Form UI', 'P0', 'Dec 17', 'Dec 18', 2, 'Build submission form with GitHub URL input and validation', '5.3'),
        ('5.5', 'Create Admin Capstone Review Dashboard', 'P1', 'Dec 18', 'Dec 20', 2, 'Admin page to view all capstone submissions with GitHub links', '5.4'),
    ]
    
    for task in capstone_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'backend, database' if 'Schema' in task[1] or 'API' in task[1] or 'Validation' in task[1] else 'frontend, ui', task_format)
        board.write(row, 6, 'Week 2', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 6: Course Content
    board.write(row, 0, '6', epic_format)
    board.write(row, 1, 'Course Content Population', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P1', priority_p1_format)
    board.write(row, 5, 'content, data', epic_format)
    board.write(row, 6, 'Week 2', epic_format)
    board.write(row, 7, datetime(2025, 12, 16), date_format)
    board.write(row, 8, datetime(2025, 12, 20), date_format)
    board.write(row, 9, 5, number_format)
    board.write(row, 10, 'Populate courses with content for both pathways', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    content_tasks = [
        ('6.1', 'Add Foundational Pathway Courses', 'P1', 'Dec 16', 'Dec 18', 2, 'Create courses for Python Basics, SQL Fundamentals, Data Analysis', ''),
        ('6.2', 'Add GenAI Pathway Courses', 'P1', 'Dec 18', 'Dec 20', 2, 'Create courses for LLM Basics, Prompt Engineering, RAG Implementation', ''),
        ('6.3', 'Add Quiz Questions for All Courses', 'P1', 'Dec 19', 'Dec 20', 1, 'Create 5-10 MCQ questions per course', ''),
    ]
    
    for task in content_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'content', task_format)
        board.write(row, 6, 'Week 2', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # ====== WEEK 3 ======
    row += 1
    board.merge_range(row, 0, row, 11, 'WEEK 3: TESTING, POLISH & DEPLOYMENT (Dec 23-27, 2025)', week_header_format)
    row += 1
    
    # Epic 7: E2E Testing
    board.write(row, 0, '7', epic_format)
    board.write(row, 1, 'End-to-End Testing', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'testing, qa', epic_format)
    board.write(row, 6, 'Week 3', epic_format)
    board.write(row, 7, datetime(2025, 12, 23), date_format)
    board.write(row, 8, datetime(2025, 12, 25), date_format)
    board.write(row, 9, 8, number_format)
    board.write(row, 10, 'Comprehensive testing of all new features', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    test_tasks = [
        ('7.1', 'Write SSO Integration Tests', 'P0', 'Dec 23', 'Dec 23', 2, 'Add tests for SSO login flow and callback handling', ''),
        ('7.2', 'Write Pathway Selection Tests', 'P0', 'Dec 23', 'Dec 23', 1, 'Test pathway listing and enrollment endpoints', '7.1'),
        ('7.3', 'Write Hands-On Feature Tests', 'P0', 'Dec 23', 'Dec 24', 2, 'Test hands-on exercise retrieval and submission validation', '7.2'),
        ('7.4', 'Write Capstone Submission Tests', 'P0', 'Dec 24', 'Dec 24', 1, 'Test GitHub URL submission and validation', '7.3'),
        ('7.5', 'Perform User Acceptance Testing', 'P0', 'Dec 24', 'Dec 25', 2, 'End-to-end testing with real users on staging', '7.4'),
    ]
    
    for task in test_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'testing', task_format)
        board.write(row, 6, 'Week 3', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 8: UI Polish
    board.write(row, 0, '8', epic_format)
    board.write(row, 1, 'UI/UX Polish & Bug Fixes', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P1', priority_p1_format)
    board.write(row, 5, 'frontend, polish', epic_format)
    board.write(row, 6, 'Week 3', epic_format)
    board.write(row, 7, datetime(2025, 12, 23), date_format)
    board.write(row, 8, datetime(2025, 12, 25), date_format)
    board.write(row, 9, 5, number_format)
    board.write(row, 10, 'Final UI improvements and bug fixes', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    polish_tasks = [
        ('8.1', 'Responsive Design Verification', 'P1', 'Dec 23', 'Dec 23', 1, 'Test and fix responsive layouts for new components', ''),
        ('8.2', 'Loading States & Error Handling', 'P1', 'Dec 23', 'Dec 24', 2, 'Add proper loading states and error messages for new features', '8.1'),
        ('8.3', 'Fix Critical Bugs from Testing', 'P0', 'Dec 24', 'Dec 25', 2, 'Address bugs discovered during UAT', '7.5'),
    ]
    
    for task in polish_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'frontend', task_format)
        board.write(row, 6, 'Week 3', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 9: Production Deployment
    board.write(row, 0, '9', epic_format)
    board.write(row, 1, 'Production Deployment', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P0', priority_p0_format)
    board.write(row, 5, 'deployment, production', epic_format)
    board.write(row, 6, 'Week 3', epic_format)
    board.write(row, 7, datetime(2025, 12, 26), date_format)
    board.write(row, 8, datetime(2025, 12, 27), date_format)
    board.write(row, 9, 5, number_format)
    board.write(row, 10, 'Deploy to production and verify', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    deploy_tasks = [
        ('9.1', 'Deploy Backend to Production', 'P0', 'Dec 26', 'Dec 26', 1, 'Deploy FastAPI backend to cloud with all new features', '8.3'),
        ('9.2', 'Deploy Frontend to Production', 'P0', 'Dec 26', 'Dec 26', 1, 'Deploy React frontend to CDN/App Service', '9.1'),
        ('9.3', 'Configure Production SSO', 'P0', 'Dec 26', 'Dec 26', 1, 'Update Azure AD app with production redirect URIs', '9.2'),
        ('9.4', 'Run Database Migrations', 'P0', 'Dec 26', 'Dec 26', 1, 'Execute all migrations on production database', '9.1'),
        ('9.5', 'Post-Deployment Verification', 'P0', 'Dec 27', 'Dec 27', 1, 'Verify all features working in production', '9.4'),
    ]
    
    for task in deploy_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else priority_p1_format
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'deployment', task_format)
        board.write(row, 6, 'Week 3', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # Epic 10: Documentation
    board.write(row, 0, '10', epic_format)
    board.write(row, 1, 'Documentation & Handoff', epic_format)
    board.write(row, 2, 'To Do', status_todo_format)
    board.write(row, 3, 'Epic', epic_format)
    board.write(row, 4, 'P1', priority_p1_format)
    board.write(row, 5, 'documentation, training', epic_format)
    board.write(row, 6, 'Week 3', epic_format)
    board.write(row, 7, datetime(2025, 12, 26), date_format)
    board.write(row, 8, datetime(2025, 12, 27), date_format)
    board.write(row, 9, 3, number_format)
    board.write(row, 10, 'Update documentation and prepare user guides', epic_format)
    board.write(row, 11, '', epic_format)
    row += 1
    
    doc_tasks = [
        ('10.1', 'Update Technical Documentation', 'P1', 'Dec 26', 'Dec 27', 1, 'Update README, API docs with new endpoints and features', '9.5'),
        ('10.2', 'Create User Guide for New Features', 'P1', 'Dec 27', 'Dec 27', 1, 'Create user guide for SSO login, hands-on exercises, capstone submission', '10.1'),
        ('10.3', 'Admin Training Documentation', 'P2', 'Dec 27', 'Dec 27', 1, 'Document admin workflows for reviewing capstones and managing pathways', '10.2'),
    ]
    
    for task in doc_tasks:
        board.write(row, 0, task[0], task_format)
        board.write(row, 1, task[1], task_format)
        board.write(row, 2, 'To Do', status_todo_format)
        board.write(row, 3, 'Task', task_format)
        prio_fmt = priority_p0_format if task[2] == 'P0' else (priority_p1_format if task[2] == 'P1' else priority_p2_format)
        board.write(row, 4, task[2], prio_fmt)
        board.write(row, 5, 'documentation', task_format)
        board.write(row, 6, 'Week 3', task_format)
        start_day = int(task[3].split()[1])
        end_day = int(task[4].split()[1])
        board.write(row, 7, datetime(2025, 12, start_day), date_format)
        board.write(row, 8, datetime(2025, 12, end_day), date_format)
        board.write(row, 9, task[5], number_format)
        board.write(row, 10, task[6], task_format)
        board.write(row, 11, task[7], task_format)
        row += 1
    
    # ========== SHEET 2: SUMMARY ==========
    summary = workbook.add_worksheet('Summary')
    summary.set_column('A:A', 25)
    summary.set_column('B:B', 15)
    summary.set_column('C:C', 40)
    
    summary.write(0, 0, 'PROJECT SUMMARY', header_format)
    summary.merge_range(0, 0, 0, 2, 'PROJECT SUMMARY', header_format)
    
    summary.write(2, 0, 'Total Story Points', summary_format)
    summary.write(2, 1, '76', summary_format)
    summary.write(2, 2, '', summary_format)
    
    summary.write(4, 0, 'Week', header_format)
    summary.write(4, 1, 'Points', header_format)
    summary.write(4, 2, 'Focus Areas', header_format)
    
    summary.write(5, 0, 'Week 1 (Dec 9-13)', task_format)
    summary.write(5, 1, '29', number_format)
    summary.write(5, 2, 'Microsoft SSO, Pathways Setup, Infrastructure', task_format)
    
    summary.write(6, 0, 'Week 2 (Dec 16-20)', task_format)
    summary.write(6, 1, '26', number_format)
    summary.write(6, 2, 'Hands-On Feature, GitHub Capstone, Content', task_format)
    
    summary.write(7, 0, 'Week 3 (Dec 23-27)', task_format)
    summary.write(7, 1, '21', number_format)
    summary.write(7, 2, 'Testing, Polish, Deployment, Documentation', task_format)
    
    # Milestones
    summary.write(9, 0, 'KEY MILESTONES', header_format)
    summary.merge_range(9, 0, 9, 2, 'KEY MILESTONES', header_format)
    
    milestones = [
        ('Dec 13', 'Week 1 Complete', 'SSO working, pathways configured, infrastructure ready'),
        ('Dec 20', 'Week 2 Complete', 'Hands-on feature live, capstone submission ready'),
        ('Dec 25', 'Testing Complete', 'All tests passing, UAT signed off'),
        ('Dec 27', 'Go Live', 'Production deployment complete, documentation ready'),
    ]
    
    summary.write(10, 0, 'Date', header_format)
    summary.write(10, 1, 'Milestone', header_format)
    summary.write(10, 2, 'Deliverables', header_format)
    
    for i, m in enumerate(milestones):
        summary.write(11 + i, 0, m[0], task_format)
        summary.write(11 + i, 1, m[1], task_format)
        summary.write(11 + i, 2, m[2], task_format)
    
    # ========== SHEET 3: RISKS ==========
    risks = workbook.add_worksheet('Risks')
    risks.set_column('A:A', 8)
    risks.set_column('B:B', 30)
    risks.set_column('C:C', 12)
    risks.set_column('D:D', 12)
    risks.set_column('E:E', 50)
    risks.set_column('F:F', 50)
    
    risks.write(0, 0, 'ID', header_format)
    risks.write(0, 1, 'Risk', header_format)
    risks.write(0, 2, 'Probability', header_format)
    risks.write(0, 3, 'Impact', header_format)
    risks.write(0, 4, 'Description', header_format)
    risks.write(0, 5, 'Mitigation', header_format)
    
    risk_data = [
        ('R1', 'Azure AD Access Delay', 'Medium', 'High', 'Delay in getting Azure AD admin access could block SSO implementation', 'Start Azure AD registration process immediately; escalate to IT admin'),
        ('R2', 'Content Creation Bottleneck', 'Medium', 'Medium', 'Course content may not be ready in time for population', 'Use placeholder content; prioritize minimum viable courses'),
        ('R3', 'Code Execution Security', 'Low', 'High', 'Running user code server-side has security implications', 'Use client-side validation initially; plan sandboxed execution later'),
        ('R4', 'Holiday Period Impact', 'High', 'Medium', 'Dec 23-27 includes Christmas; reduced availability', 'Front-load critical work; have clear handoff plan'),
        ('R5', 'Integration Complexity', 'Medium', 'Medium', 'New features may have unforeseen integration issues', 'Allocate buffer time; have rollback plan ready'),
    ]
    
    for i, r in enumerate(risk_data):
        risks.write(i + 1, 0, r[0], risk_format)
        risks.write(i + 1, 1, r[1], risk_format)
        risks.write(i + 1, 2, r[2], risk_format)
        risks.write(i + 1, 3, r[3], risk_format)
        risks.write(i + 1, 4, r[4], risk_format)
        risks.write(i + 1, 5, r[5], risk_format)
    
    # ========== SHEET 4: PATHWAY DETAILS ==========
    pathways = workbook.add_worksheet('Pathway Details')
    pathways.set_column('A:A', 20)
    pathways.set_column('B:B', 30)
    pathways.set_column('C:C', 50)
    pathways.set_column('D:D', 15)
    
    pathways.write(0, 0, 'Pathway', header_format)
    pathways.write(0, 1, 'SubTrack', header_format)
    pathways.write(0, 2, 'Courses', header_format)
    pathways.write(0, 3, 'Hands-On', header_format)
    
    pathway_data = [
        ('Foundational', 'Python Basics', 'Python Fundamentals, Data Types, Control Flow, Functions', 'Yes'),
        ('Foundational', 'SQL Fundamentals', 'SQL Basics, Joins, Aggregations, Subqueries', 'Yes'),
        ('Foundational', 'Data Analysis', 'Pandas, Data Cleaning, Visualization, Statistics', 'Yes'),
        ('Foundational', 'Git & Version Control', 'Git Basics, Branching, Merging, GitHub', 'Yes'),
        ('GenAI', 'LLM Fundamentals', 'Intro to LLMs, Transformer Architecture, Model Types', 'No'),
        ('GenAI', 'Prompt Engineering', 'Prompting Techniques, Chain-of-Thought, Few-Shot', 'Yes'),
        ('GenAI', 'RAG Implementation', 'Vector Databases, Embeddings, Retrieval Systems', 'Yes'),
        ('GenAI', 'LangChain & Agents', 'LangChain Basics, Agents, Tools, Memory', 'Yes'),
    ]
    
    for i, p in enumerate(pathway_data):
        pathways.write(i + 1, 0, p[0], task_format)
        pathways.write(i + 1, 1, p[1], task_format)
        pathways.write(i + 1, 2, p[2], task_format)
        pathways.write(i + 1, 3, p[3], task_format)
    
    workbook.close()
    print("✅ Excel file created successfully!")
    print(r"📁 Location: c:\Users\Sarun.LAPTOP-M5IEJDVK\OneDrive - NEULEAP AI PRIVATE LIMITED\Documents\TrainingApp\training-app\Training_App_Production_Project_Plan.xlsx")


if __name__ == "__main__":
    create_project_plan()
