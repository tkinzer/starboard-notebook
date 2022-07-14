from flask import Flask, jsonify, request

app = Flask(__name__)

def parseCellsTextContent(cells):
    print('parsing cell text content', cells)
    cell = cells[0]
    line_num = "4"
    cell_num = "1"
    column_name = "cars"
    message = "governance issue: cannot use column: " + column_name
    url = "www.takecontrol.ai/explanation"
    return {"line_num": line_num, "cell_num": cell_num, "message": message, "url": url};

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.get("/score")
def score_python():
    return "Classifcation categories for AI responsibility governance scoring";

@app.post("/score")
def parsePythonAndScore():
    data = request.data
    governance_lint = []
    governance_lint = parseCellsTextContent(data)
    print(governance_lint)
    return jsonify(governance_lint);