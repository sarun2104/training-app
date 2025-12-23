"""
Export FalkorDB Graph Schema to Excel
Extracts all node labels, relationship types, and their properties from lms_graph
"""
import sys
import os
import redis
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows
import pandas as pd

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# FalkorDB connection settings
FALKORDB_CONFIG = {
    "host": os.getenv("FALKORDB_HOST", "localhost"),
    "port": int(os.getenv("FALKORDB_PORT", 6379)),
    "db": int(os.getenv("FALKORDB_DB", 0)),
    "password": os.getenv("FALKORDB_PASSWORD", None),
    "graph_name": os.getenv("FALKORDB_GRAPH_NAME", "lms_graph")
}


def get_falkordb_connection():
    """Connect to FalkorDB"""
    password = FALKORDB_CONFIG["password"]
    if password in ["", "Default", None]:
        password = None
    
    client = redis.Redis(
        host=FALKORDB_CONFIG["host"],
        port=FALKORDB_CONFIG["port"],
        db=FALKORDB_CONFIG["db"],
        password=password,
        decode_responses=True,
    )
    client.ping()
    return client


def execute_query(client, query):
    """Execute a Cypher query and return results"""
    result = client.execute_command("GRAPH.QUERY", FALKORDB_CONFIG["graph_name"], query)
    return result  # Return full result for proper parsing


def parse_node_from_result(node_data):
    """Parse a node from FalkorDB result format
    
    FalkorDB returns nodes as nested lists:
    [[['id', 0], ['labels', ['Track']], ['properties', [['prop1', 'val1'], ['prop2', 'val2']]]]]
    """
    properties = {}
    if isinstance(node_data, list):
        for item in node_data:
            if isinstance(item, list) and len(item) == 2:
                key, value = item
                if key == 'properties' and isinstance(value, list):
                    for prop in value:
                        if isinstance(prop, list) and len(prop) == 2:
                            properties[prop[0]] = prop[1]
    return properties


def get_node_labels(client):
    """Get all node labels in the graph"""
    result = execute_query(client, "CALL db.labels()")
    if result and len(result) > 1 and isinstance(result[1], list):
        return [row[0] for row in result[1]]
    return []


def get_relationship_types(client):
    """Get all relationship types in the graph"""
    result = execute_query(client, "CALL db.relationshipTypes()")
    if result and len(result) > 1 and isinstance(result[1], list):
        return [row[0] for row in result[1]]
    return []


def get_node_properties(client, label):
    """Get all properties for a specific node label with sample values"""
    query = f"MATCH (n:{label}) RETURN n LIMIT 1"
    result = execute_query(client, query)
    
    if result and len(result) > 1 and result[1]:
        # Parse the node data from FalkorDB format
        node_data = result[1][0][0]
        properties = parse_node_from_result(node_data)
        return list(properties.keys())
    return []


def get_node_property_values(client, label, limit=5):
    """Get sample property values for a node label"""
    query = f"MATCH (n:{label}) RETURN n LIMIT {limit}"
    result = execute_query(client, query)
    
    samples = []
    if result and len(result) > 1 and result[1]:
        for row in result[1]:
            node_data = row[0]
            properties = parse_node_from_result(node_data)
            samples.append(properties)
    
    # Get all property names from samples
    all_props = set()
    for sample in samples:
        all_props.update(sample.keys())
    
    return list(all_props), samples


def get_node_count(client, label):
    """Get count of nodes with a specific label"""
    query = f"MATCH (n:{label}) RETURN count(n)"
    result = execute_query(client, query)
    if result and len(result) > 1 and result[1]:
        return result[1][0][0]
    return 0


def get_relationship_count(client, rel_type):
    """Get count of relationships with a specific type"""
    query = f"MATCH ()-[r:{rel_type}]->() RETURN count(r)"
    result = execute_query(client, query)
    if result and len(result) > 1 and result[1]:
        return result[1][0][0]
    return 0


def get_relationship_endpoints(client, rel_type):
    """Get the node labels connected by a relationship type"""
    query = f"""
    MATCH (a)-[r:{rel_type}]->(b)
    RETURN DISTINCT labels(a)[0] as from_label, labels(b)[0] as to_label
    LIMIT 10
    """
    result = execute_query(client, query)
    if result and len(result) > 1 and result[1]:
        return result[1]
    return []


def get_node_sample_data(client, label, limit=5):
    """Get sample data for a node label"""
    props, samples = get_node_property_values(client, label, limit)
    return samples


def create_excel_report(client, output_path):
    """Create Excel report with FalkorDB graph schema"""
    
    print("Fetching graph schema information...")
    
    # Get all labels and relationship types
    labels = get_node_labels(client)
    rel_types = get_relationship_types(client)
    
    print(f"Found {len(labels)} node labels and {len(rel_types)} relationship types")
    
    # Collect node information
    node_data = []
    for label in labels:
        properties = get_node_properties(client, label)
        count = get_node_count(client, label)
        node_data.append({
            'Node Label': label,
            'Property Count': len(properties),
            'Node Count': count,
            'Properties': ', '.join(properties) if properties else 'No properties'
        })
    
    # Collect relationship information
    rel_data = []
    for rel_type in rel_types:
        count = get_relationship_count(client, rel_type)
        endpoints = get_relationship_endpoints(client, rel_type)
        endpoint_str = '; '.join([f"({e[0]})-[{rel_type}]->({e[1]})" for e in endpoints]) if endpoints else 'Unknown'
        rel_data.append({
            'Relationship Type': rel_type,
            'Count': count,
            'Pattern': endpoint_str
        })
    
    # Create Excel workbook
    wb = Workbook()
    
    # Styling
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="2E7D32", end_color="2E7D32", fill_type="solid")
    rel_header_fill = PatternFill(start_color="1565C0", end_color="1565C0", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # ==================== Sheet 1: Graph Overview ====================
    ws1 = wb.active
    ws1.title = "Graph Overview"
    
    # Title
    ws1.cell(row=1, column=1, value=f"FalkorDB Graph Schema: {FALKORDB_CONFIG['graph_name']}")
    ws1.cell(row=1, column=1).font = Font(bold=True, size=16, color="1B5E20")
    ws1.merge_cells('A1:D1')
    
    # Summary stats
    ws1.cell(row=3, column=1, value="Summary Statistics")
    ws1.cell(row=3, column=1).font = Font(bold=True, size=12)
    
    ws1.cell(row=4, column=1, value="Total Node Labels:")
    ws1.cell(row=4, column=2, value=len(labels))
    ws1.cell(row=5, column=1, value="Total Relationship Types:")
    ws1.cell(row=5, column=2, value=len(rel_types))
    ws1.cell(row=6, column=1, value="Total Nodes:")
    ws1.cell(row=6, column=2, value=sum(d['Node Count'] for d in node_data))
    ws1.cell(row=7, column=1, value="Total Relationships:")
    ws1.cell(row=7, column=2, value=sum(d['Count'] for d in rel_data))
    
    # Node Labels summary
    ws1.cell(row=9, column=1, value="Node Labels")
    ws1.cell(row=9, column=1).font = Font(bold=True, size=12)
    
    node_df = pd.DataFrame(node_data)
    for r_idx, row in enumerate(dataframe_to_rows(node_df, index=False, header=True), 10):
        for c_idx, value in enumerate(row, 1):
            cell = ws1.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border
            if r_idx == 10:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal='center')
    
    # Relationship Types summary
    rel_start_row = 10 + len(node_data) + 3
    ws1.cell(row=rel_start_row, column=1, value="Relationship Types")
    ws1.cell(row=rel_start_row, column=1).font = Font(bold=True, size=12)
    
    rel_df = pd.DataFrame(rel_data)
    for r_idx, row in enumerate(dataframe_to_rows(rel_df, index=False, header=True), rel_start_row + 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws1.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border
            if r_idx == rel_start_row + 1:
                cell.font = header_font
                cell.fill = rel_header_fill
                cell.alignment = Alignment(horizontal='center')
    
    # Adjust column widths
    ws1.column_dimensions['A'].width = 25
    ws1.column_dimensions['B'].width = 18
    ws1.column_dimensions['C'].width = 15
    ws1.column_dimensions['D'].width = 60
    
    # ==================== Sheet 2: Node Labels Detail ====================
    ws2 = wb.create_sheet(title="Node Labels Detail")
    
    # Create detailed property list per node
    detailed_node_data = []
    for label in labels:
        properties = get_node_properties(client, label)
        if properties:
            for prop in properties:
                detailed_node_data.append({
                    'Node Label': label,
                    'Property Name': prop
                })
        else:
            detailed_node_data.append({
                'Node Label': label,
                'Property Name': '(no properties)'
            })
    
    detail_df = pd.DataFrame(detailed_node_data)
    for r_idx, row in enumerate(dataframe_to_rows(detail_df, index=False, header=True), 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border
            if r_idx == 1:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal='center')
    
    ws2.column_dimensions['A'].width = 25
    ws2.column_dimensions['B'].width = 35
    
    # ==================== Sheet 3: Relationships Detail ====================
    ws3 = wb.create_sheet(title="Relationships Detail")
    
    # Create detailed relationship patterns
    rel_detail_data = []
    for rel_type in rel_types:
        endpoints = get_relationship_endpoints(client, rel_type)
        if endpoints:
            for e in endpoints:
                rel_detail_data.append({
                    'Relationship Type': rel_type,
                    'From Node': e[0],
                    'To Node': e[1],
                    'Pattern': f"(:{e[0]})-[:{rel_type}]->(:{e[1]})"
                })
        else:
            rel_detail_data.append({
                'Relationship Type': rel_type,
                'From Node': 'Unknown',
                'To Node': 'Unknown',
                'Pattern': f"()-[:{rel_type}]->()"
            })
    
    rel_detail_df = pd.DataFrame(rel_detail_data)
    for r_idx, row in enumerate(dataframe_to_rows(rel_detail_df, index=False, header=True), 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws3.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border
            if r_idx == 1:
                cell.font = header_font
                cell.fill = rel_header_fill
                cell.alignment = Alignment(horizontal='center')
    
    ws3.column_dimensions['A'].width = 25
    ws3.column_dimensions['B'].width = 20
    ws3.column_dimensions['C'].width = 20
    ws3.column_dimensions['D'].width = 50
    
    # ==================== Individual Node Sheets with Sample Data ====================
    for label in labels:
        sheet_name = f"Node_{label[:25]}" if len(label) > 25 else f"Node_{label}"
        ws = wb.create_sheet(title=sheet_name)
        
        # Title
        ws.cell(row=1, column=1, value=f"Node Label: {label}")
        ws.cell(row=1, column=1).font = Font(bold=True, size=14, color="1B5E20")
        
        # Get sample data
        samples = get_node_sample_data(client, label, 10)
        
        if samples:
            # Get all unique properties
            all_props = set()
            for sample in samples:
                all_props.update(sample.keys())
            all_props = sorted(list(all_props))
            
            # Properties header
            ws.cell(row=3, column=1, value="Properties (Sample Data)")
            ws.cell(row=3, column=1).font = Font(bold=True)
            
            # Write headers
            for c_idx, prop in enumerate(all_props, 1):
                cell = ws.cell(row=4, column=c_idx, value=prop)
                cell.font = header_font
                cell.fill = header_fill
                cell.border = thin_border
            
            # Write sample data
            for r_idx, sample in enumerate(samples, 5):
                for c_idx, prop in enumerate(all_props, 1):
                    value = sample.get(prop, '')
                    # Truncate long values
                    if isinstance(value, str) and len(value) > 100:
                        value = value[:100] + '...'
                    cell = ws.cell(row=r_idx, column=c_idx, value=value)
                    cell.border = thin_border
            
            # Adjust column widths
            for c_idx, prop in enumerate(all_props, 1):
                col_letter = ws.cell(row=1, column=c_idx).column_letter
                ws.column_dimensions[col_letter].width = min(40, max(15, len(prop) + 5))
        else:
            ws.cell(row=3, column=1, value="No data found for this node label")
    
    # Save workbook
    wb.save(output_path)
    print(f"\nExcel file saved to: {output_path}")
    
    return node_data, rel_data


def main():
    print("=" * 60)
    print("FalkorDB Graph Schema Export")
    print("=" * 60)
    print(f"\nConnecting to FalkorDB...")
    print(f"Host: {FALKORDB_CONFIG['host']}:{FALKORDB_CONFIG['port']}")
    print(f"Graph: {FALKORDB_CONFIG['graph_name']}")
    print("-" * 60)
    
    try:
        client = get_falkordb_connection()
        print("Connected successfully!\n")
        
        # Output path
        output_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "falkordb_graph_schema.xlsx"
        )
        
        # Create Excel report
        node_data, rel_data = create_excel_report(client, output_path)
        
        print("\n" + "=" * 60)
        print("GRAPH SCHEMA EXPORTED SUCCESSFULLY!")
        print("=" * 60)
        
        print(f"\n📊 Node Labels ({len(node_data)}):")
        for node in node_data:
            print(f"  • {node['Node Label']}: {node['Node Count']} nodes, {node['Property Count']} properties")
        
        print(f"\n🔗 Relationship Types ({len(rel_data)}):")
        for rel in rel_data:
            print(f"  • {rel['Relationship Type']}: {rel['Count']} relationships")
        
        print(f"\n📁 Excel file: {output_path}")
        
        client.close()
        
    except redis.ConnectionError as e:
        print(f"ERROR: Could not connect to FalkorDB!")
        print(f"Details: {e}")
        print("\nMake sure FalkorDB/Redis is running and accessible.")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
