from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.get("/score")
def score_python():
    return "Classifcation categories for AI responsibility governance scoring";

@app.post("/score")
def parsePythonAndScore():
  governance_lint = []
  
  line_num = "4"
  cell_num = "1"
  column_name = "cars"
  message = "governance issue: cannot use column: " + column_name
  url = "www.takecontrol.ai/explanation"

  
  governance_lint.append({"line_num": line_num, "cell_num": cell_num, "message": message, "url": url})
  print(governance_lint);
  return jsonify([lint for lint in governance_lint]);