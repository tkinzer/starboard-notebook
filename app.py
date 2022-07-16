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
    
    # METHOD 1 - FAIL
    # matches = [found for found in re.recuiter(r"pandas", data.textContent)]
    # if len(matches) > 0:
    #     for (i, pattern) in enumerate(patterns):
    #         match = re.search(pattern, data.textContent)
    #               if match:
    #         ln = match.span()[0]
    #         id = i
    #         col = i
    #         msg = "pandas come in all shapes, colors, and sizes - use the DataFrame constructor to create a DataFrame from an existing array-like object, a sequence of tuples, a dictionary, or an already-constructed pandas object"
    #         url = "www.takecontrol.ai/explanation"
    #         payload.append({"ln": ln, "id": id, "col": col, "msg": msg, "url": url})

    # METHOD 2
    # TODO: test using patterns to do regex all at once 
    #  ex. re.search(patterns, searchText, re.IGNORECASE)
    hasReadCsv = re.search(r"read_csv", searchText, re.IGNORECASE)
    if hasReadCsv:
        # FIXME: Currently, this is the index of the character, not the line number
        ln = hasReadCsv.span()[0]
        msg = "Read CSV"
        id = dict['cellId']
        payload.append({"line_num": ln, "cell_id": id, "col_num": col, "message": msg, "url": url})
        print(payload)

    # check for url in cell
    hasUrl = re.search(r"http", searchText, re.IGNORECASE)
    if hasUrl:
        startIdx = hasUrl.span()[0]
        endIdx = re.search(r".csv", searchText, re.IGNORECASE).span()[1]
        url = searchText[startIdx:endIdx]
        print('found url to import for panda: ' + url)
        ln = hasUrl.span()[0]
        msg = "URL"
        payload.append({"line_num": ln, "cell_id": id, "col_num": col, "message": msg, "url": url})

    return payload

# The payload is a JSON object with the following fields:
#   - lintItem[].line_num: the line number of the cell
#   - lintItem[].cell_id: the cell number of the cell
#   - lintItem[].column_name: the name of the column
#   - lintItem[].message: the message to display
#   - lintItem[].url: the URL to display
# @app.route('/format-cell-text', methods=['POST'])
# re.sub(pattern_1 | pattern_2, replacement, string, count=0, flags=0)
def useRegex(input):
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