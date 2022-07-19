import ast
from flask import Flask, jsonify, request
import pandas as pd
import pyodide
import re

app = Flask(__name__)

@app.get("/score")
def score_python():
    return "Classifcation categories for AI responsibility governance scoring";

@app.post("/score")
def parsePythonAndScore():
    data = request.data
    return jsonify(lintCellTextContent(data));

def lintCellTextContent(cell):
    print ("searching for lint violations...")
    ln = -1
    id = -1
    col = ""
    msg = ""
    url = "www.takecontrol.ai/explanation"
    payload = []
    data = cell.decode('utf-8')
    dict = ast.literal_eval(data)
    searchText = dict['textContent'] 
    keywords = ["sex", "race"]
    patterns = ["[^a-zA-Z0-9_]", "import pandas", "read_csv", "http", "pandas.DataFrame", "pandas.read_csv"]

    # METHOD 2
    # Check for patterns that would indicate the code is creating a dataframe using pandas.
    # If the code is creating a dataframe, then check for the column headers that contain any of the keywords.
    # If the column headers contain any of the keywords, then return a violation.
    for pattern in patterns:
        if re.search(pattern, searchText):
            print ("found pattern: " + pattern)
            url = extractUrl(searchText)
            df = pd.read_csv(url)
            cols = df.columns
            for col in cols:
                for keyword in keywords:
                    if keyword in col:
                        print ("found keyword: " + keyword)
                        ln = dict['lineNumber']
                        id = dict['cellId']
                        col = col
                        msg = "Column header contains a keyword: " + keyword
                        url = "www.takecontrol.ai/explanation"
                        payload.append({"line_num": ln, "cell_id": id, "column_name": col, "message": msg, "url": url})
                        break
    return payload

def extractUrl(input):
    pattern = re.compile(r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+", re.IGNORECASE)
    return re.findall(pattern, input);

def useRegexFormatter(input):
    patternNewline = re.compile(r"\\n", re.IGNORECASE)
    patternComma = re.compile(r",", re.IGNORECASE)
    patternQuote = re.compile(r"\"", re.IGNORECASE)
    patternBrace = re.compile(r"\{", re.IGNORECASE)
    patternBracket = re.compile(r"\[", re.IGNORECASE)
    patternParen = re.compile(r"\(", re.IGNORECASE)
    patternWhiteSpace = re.compile(r"\s+", re.IGNORECASE)
    # fix patterns to use the pattern string that is passed to compile
    return re.sub(patternNewline | patternWhiteSpace, "", input)

# returns an array of matches found between the column header titles and the keywords List
def findColumnHeaderMatches(input):
    pattern = re.compile(r"\s+", re.IGNORECASE)
    return re.findall(pattern, input);