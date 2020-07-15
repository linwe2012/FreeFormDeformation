from flask import Flask, send_file
app = Flask(__name__, static_folder='build/static')

@app.route('/')
def index():
    return send_file('build/index.html')

@app.route('/<path:p>')
def others(p):
    return send_file('build/'+p)

app.run()